package middleware

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"v0-jm/internal/services"
)

// clientBucket representa el estado del cubo de fichas de una IP específica.
type clientBucket struct {
	tokens        float64
	maxTokens     float64
	refillRate    float64 // tokens por segundo
	lastRefill    time.Time
	lastSeen      time.Time
	lastEmailSent time.Time
	blockedCount  int
}

// RateLimiter administra los cubos de fichas por IP con protección concurrente.
type RateLimiter struct {
	mu           sync.Mutex
	clients      map[string]*clientBucket
	maxTokens    float64
	refillRate   float64
	emailService *services.EmailService
}

// NewRateLimiter crea un nuevo limitador con capacidad máxima (burst) y velocidad de recarga.
func NewRateLimiter(maxTokens float64, refillRate float64, emailService *services.EmailService) *RateLimiter {
	rl := &RateLimiter{
		clients:      make(map[string]*clientBucket),
		maxTokens:    maxTokens,
		refillRate:   refillRate,
		emailService: emailService,
	}

	// Iniciar limpieza automática de IPs inactivas cada 10 minutos
	go rl.cleanupLoop()

	return rl
}

// Allow evalúa si la IP especificada tiene fichas suficientes para proceder.
func (rl *RateLimiter) Allow(ip string, endpoint string, userAgent string) (bool, int, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	bucket, exists := rl.clients[ip]
	if !exists {
		bucket = &clientBucket{
			tokens:       rl.maxTokens,
			maxTokens:    rl.maxTokens,
			refillRate:   rl.refillRate,
			lastRefill:   now,
			lastSeen:     now,
			blockedCount: 0,
		}
		rl.clients[ip] = bucket
	}

	// 1. Recargar fichas en base al tiempo transcurrido
	elapsed := now.Sub(bucket.lastRefill).Seconds()
	bucket.tokens = math.Min(bucket.maxTokens, bucket.tokens+(elapsed*bucket.refillRate))
	bucket.lastRefill = now
	bucket.lastSeen = now

	// 2. Verificar disponibilidad de ficha
	if bucket.tokens >= 1.0 {
		bucket.tokens -= 1.0
		remainingTokens := int(math.Floor(bucket.tokens))
		return true, remainingTokens, 0
	}

	// 3. Límite excedido: incrementar contador de bloqueos
	bucket.blockedCount++
	neededTokens := 1.0 - bucket.tokens
	retryAfterSec := time.Duration(math.Ceil(neededTokens/bucket.refillRate)) * time.Second

	// 4. Disparar alerta por correo si es la primera violación seria o si han pasado 15 minutos desde el último email
	if rl.emailService != nil && (bucket.blockedCount == 1 || bucket.blockedCount == 5 || time.Since(bucket.lastEmailSent) > 15*time.Minute) {
		bucket.lastEmailSent = now
		count := bucket.blockedCount
		go func(ipAddr, endp, ua string, totalBlocked int) {
			log.Printf("🚨 [RateLimiter] Bot/Alta frecuencia detectada en IP %s. Enviando alerta por correo...", ipAddr)
			rl.emailService.SendBotAlertEmail(ipAddr, endp, ua, totalBlocked)
		}(ip, endpoint, userAgent, count)
	}

	return false, 0, retryAfterSec
}

// cleanupLoop elimina entradas de IPs que no han tenido actividad en los últimos 30 minutos.
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, bucket := range rl.clients {
			if now.Sub(bucket.lastSeen) > 30*time.Minute {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// GetClientIP extrae la IP real del cliente respetando cabeceras de proxies o CDNs (ej. X-Forwarded-For, X-Real-IP).
func GetClientIP(r *http.Request) string {
	// Cabeceras comunes de proxy o Cloudflare
	for _, header := range []string{"CF-Connecting-IP", "X-Real-IP", "X-Forwarded-For"} {
		if val := r.Header.Get(header); val != "" {
			// X-Forwarded-For puede ser una lista separada por comas (client, proxy1, proxy2)
			ips := strings.Split(val, ",")
			clientIP := strings.TrimSpace(ips[0])
			if clientIP != "" {
				return clientIP
			}
		}
	}

	// Extraer IP de RemoteAddr si no hay cabecera proxy
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// WrapRateLimit devuelve un middleware http.Handler que aplica el Rate Limiting antes de invocar el handler interno.
func WrapRateLimit(limiter *RateLimiter, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := GetClientIP(r)
		userAgent := r.UserAgent()
		endpoint := r.URL.Path

		allowed, remaining, retryAfter := limiter.Allow(ip, endpoint, userAgent)

		// Configurar encabezados HTTP estándar de Rate Limit
		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%.0f", limiter.maxTokens))
		w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

		if !allowed {
			retrySeconds := int(retryAfter.Seconds())
			if retrySeconds < 1 {
				retrySeconds = 1
			}

			w.Header().Set("Retry-After", fmt.Sprintf("%d", retrySeconds))
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusTooManyRequests)

			json.NewEncoder(w).Encode(map[string]interface{}{
				"error":        "Too Many Requests",
				"message":      "Se ha excedido la tasa máxima de peticiones permitida. Por favor, reintenta más tarde.",
				"retry_after":  retrySeconds,
				"status_code":  429,
			})
			return
		}

		next(w, r)
	}
}
