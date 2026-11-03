package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	_ "net/http/pprof"
	"os"
	"regexp"
	"strings"
	"time"

	_ "github.com/lib/pq"

	"v0-jm/internal/config"
	"v0-jm/internal/middleware"
	"v0-jm/internal/services"
)

// Audit handler classes (preserved for compatibility)
type AuditResponse struct {
	MatchPercentage int      `json:"match_percentage"`
	UpcyclingHints  []string `json:"upcycling_hints"`
}

func auditHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	res := AuditResponse{
		MatchPercentage: 85,
		UpcyclingHints:  []string{"Destacar experiencia en RPA", "Enfocar proyectos con métricas de ROI"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// Vibecode Structs
type StatusResponse struct {
	TotalSeats            int       `json:"total_seats"`
	SeatsTaken            int       `json:"seats_taken"`
	SeatsRemaining        int       `json:"seats_remaining"`
	GoldenSpotsRemaining  int       `json:"golden_spots_remaining"`
	ActivePhase           int       `json:"active_phase"` // 1, 2, 3 or 4 (Full Price)
	ActivePrice           int       `json:"active_price"` // in CLP
	DiscountPercentage    int       `json:"discount_percentage"`
	NextPhaseDeadline     time.Time `json:"next_phase_deadline"`
	SecondsToNextPhase    int64     `json:"seconds_to_next_phase"`
	OfficialLaunchDate    time.Time `json:"official_launch_date"`
}

type EnrollRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	CouponCode string `json:"coupon_code"`
}

type EnrollResponse struct {
	RegistrationID string `json:"registration_id"`
	CheckoutURL    string `json:"checkout_url"`
	AmountToPay    int    `json:"amount_to_pay"`
	Status         string `json:"status"`
}

// Global DB pool connection
var db *sql.DB

func initDB() {
	postgresURL := os.Getenv("POSTGRES_URL")
	if postgresURL == "" {
		log.Println("⚠️ POSTGRES_URL environment variable is missing. Database endpoints will fall back to mocked mode.")
		return
	}

	// Clean supa custom query parameter if present for lib/pq
	if strings.Contains(postgresURL, "supa=") {
		parts := strings.Split(postgresURL, "?")
		if len(parts) > 1 {
			queryParams := strings.Split(parts[1], "&")
			var filtered []string
			for _, param := range queryParams {
				if !strings.HasPrefix(param, "supa=") {
					filtered = append(filtered, param)
				}
			}
			if len(filtered) > 0 {
				postgresURL = parts[0] + "?" + strings.Join(filtered, "&")
			} else {
				postgresURL = parts[0]
			}
		}
	}

	var err error
	db, err = sql.Open("postgres", postgresURL)
	if err != nil {
		log.Fatalf("❌ Error opening database connection: %v", err)
	}

	// Set connection pool limits for high efficiency and resource optimization
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify connection
	err = db.Ping()
	if err != nil {
		log.Printf("⚠️ Database ping failed: %v. Running in mockup mode.", err)
		db = nil
	} else {
		log.Println("✅ Connected to PostgreSQL successfully!")
	}
}

// CalculatePricing returns the pricing details based on current time
func CalculatePricing(now time.Time) (phase int, price int, discount int, deadline time.Time) {
	// Schedule dates in UTC/Local based on Chile timezone offset (assume local server configurations)
	loc, err := time.LoadLocation("America/Santiago")
	if err != nil {
		loc = time.UTC
	}

	// Deadlines (end of day 23:59:59 in Chile timezone)
	d1 := time.Date(2026, 7, 15, 23, 59, 59, 0, loc)
	d2 := time.Date(2026, 7, 22, 23, 59, 59, 0, loc)
	d3 := time.Date(2026, 7, 29, 23, 59, 59, 0, loc)

	basePrice := 295000

	if now.Before(d1) {
		return 1, 206500, 30, d1
	} else if now.Before(d2) {
		return 2, 236000, 20, d2
	} else if now.Before(d3) {
		return 3, 265500, 10, d3
	} else {
		// Price Full
		return 4, basePrice, 0, time.Date(2026, 8, 5, 0, 0, 0, 0, loc) // Launch date is August 5
	}
}

// Endpoint Status
func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Fetch dynamic stats from DB
	seatsTaken := 0
	totalSeats := 33
	goldenSeats := 8

	if db != nil {
		err := db.QueryRow("SELECT COUNT(*) FROM vibecode_registrations WHERE status = 'paid'").Scan(&seatsTaken)
		if err != nil {
			log.Printf("Error counting registrations: %v", err)
		}
		
		var maxVal, goldVal string
		err = db.QueryRow("SELECT value FROM vibecode_settings WHERE key = 'max_seats'").Scan(&maxVal)
		if err == nil {
			fmt.Sscanf(maxVal, "%d", &totalSeats)
		}
		err = db.QueryRow("SELECT value FROM vibecode_settings WHERE key = 'golden_seats'").Scan(&goldVal)
		if err == nil {
			fmt.Sscanf(goldVal, "%d", &goldenSeats)
		}
	} else {
		// Mock data for local testing when DB is offline
		seatsTaken = 3
	}

	loc, _ := time.LoadLocation("America/Santiago")
	if loc == nil {
		loc = time.UTC
	}
	launchDate := time.Date(2026, 8, 5, 19, 0, 0, 0, loc)

	now := time.Now()
	phase, price, discount, deadline := CalculatePricing(now)

	goldenRemaining := goldenSeats - seatsTaken
	if goldenRemaining < 0 {
		goldenRemaining = 0
	}

	secondsRemaining := int64(0)
	if deadline.After(now) {
		secondsRemaining = int64(deadline.Sub(now).Seconds())
	}

	res := StatusResponse{
		TotalSeats:            totalSeats,
		SeatsTaken:            seatsTaken,
		SeatsRemaining:        totalSeats - seatsTaken,
		GoldenSpotsRemaining:  goldenRemaining,
		ActivePhase:           phase,
		ActivePrice:           price,
		DiscountPercentage:    discount,
		NextPhaseDeadline:     deadline,
		SecondsToNextPhase:    secondsRemaining,
		OfficialLaunchDate:    launchDate,
	}

	json.NewEncoder(w).Encode(res)
}

// Endpoint Enroll
func enrollHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for testing
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req EnrollRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Name = strings.TrimSpace(req.Name)

	if req.Name == "" || req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Nombre y correo electrónico son requeridos"})
		return
	}

	// Calculate base phase pricing
	now := time.Now()
	_, phasePrice, _, _ := CalculatePricing(now)
	finalPrice := phasePrice

	var couponCode sql.NullString
	if req.CouponCode != "" {
		req.CouponCode = strings.TrimSpace(strings.ToUpper(req.CouponCode))
		couponCode.String = req.CouponCode
		couponCode.Valid = true
	}

	// Handle DB operations
	regID := fmt.Sprintf("reg_%d", time.Now().UnixNano())
	status := "pending"

	if db != nil {
		// Begin Transaction
		tx, err := db.Begin()
		if err != nil {
			log.Printf("Failed to begin transaction: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Error interno del servidor"})
			return
		}
		defer tx.Rollback()

		// 1. Capacity check
		var seatsTaken int
		err = tx.QueryRow("SELECT COUNT(*) FROM vibecode_registrations WHERE status = 'paid'").Scan(&seatsTaken)
		if err != nil {
			log.Printf("Failed checking capacity in tx: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var maxCapacity int
		var maxVal string
		err = tx.QueryRow("SELECT value FROM vibecode_settings WHERE key = 'max_seats'").Scan(&maxVal)
		if err == nil {
			fmt.Sscanf(maxVal, "%d", &maxCapacity)
		} else {
			maxCapacity = 33
		}

		if seatsTaken >= maxCapacity {
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "El bootcamp ha alcanzado su capacidad máxima de 33 alumnos."})
			return
		}

		// 2. Validate coupon if supplied
		if couponCode.Valid {
			var discountPct float64
			var validUntil time.Time
			var maxUses, currentUses int

			re := regexp.MustCompile(`^[A-Z]+(\d+)$`)
			matches := re.FindStringSubmatch(couponCode.String)

			if len(matches) > 1 {
				var parsedPct float64
				fmt.Sscanf(matches[1], "%f", &parsedPct)

				loc, _ := time.LoadLocation("America/Santiago")
				if loc == nil {
					loc = time.UTC
				}

				d1 := time.Date(2026, 7, 15, 23, 59, 59, 0, loc)
				d2 := time.Date(2026, 7, 22, 23, 59, 59, 0, loc)
				d3 := time.Date(2026, 7, 29, 23, 59, 59, 0, loc)

				maxAllowedDiscount := 40.0

				if now.Before(d1) {
					maxAllowedDiscount = 40.0
				} else if now.Before(d2) {
					maxAllowedDiscount = 40.0
				} else if now.Before(d3) {
					maxAllowedDiscount = 30.0
				} else {
					seatsTaken := 0
					err = tx.QueryRow("SELECT COUNT(*) FROM vibecode_registrations WHERE status = 'paid'").Scan(&seatsTaken)
					if err != nil {
						log.Printf("Failed counting seats in dynamic coupon logic: %v", err)
					}
					if seatsTaken >= 15 {
						maxAllowedDiscount = 20.0
					} else {
						maxAllowedDiscount = 40.0
					}
				}

				if parsedPct > maxAllowedDiscount || parsedPct > 40.0 {
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{
						"error": fmt.Sprintf("Este cupón de descuento (%.0f%%) ya no está disponible para esta fase. El descuento máximo permitido actual es %.0f%%.", parsedPct, maxAllowedDiscount),
					})
					return
				}

				discountPct = parsedPct

				// Upsert coupon into database to satisfy foreign key constraint
				_, err = tx.Exec(
					`INSERT INTO vibecode_coupons (code, discount_pct, valid_until, max_uses, current_uses)
					 VALUES ($1, $2, '2028-12-31T23:59:59Z', 99999, 0)
					 ON CONFLICT (code) DO UPDATE SET discount_pct = EXCLUDED.discount_pct`,
					couponCode.String, discountPct,
				)
				if err != nil {
					log.Printf("Failed to upsert dynamic coupon: %v", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			} else {
				err = tx.QueryRow("SELECT discount_pct, valid_until, max_uses, current_uses FROM vibecode_coupons WHERE code = $1", couponCode.String).
					Scan(&discountPct, &validUntil, &maxUses, &currentUses)

				if err == sql.ErrNoRows {
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": "Cupón de descuento inválido"})
					return
				} else if err != nil {
					log.Printf("Coupon query error: %v", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				if now.After(validUntil) {
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": "El cupón de descuento ha expirado"})
					return
				}

				if currentUses >= maxUses {
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": "El cupón ha agotado su cantidad de usos"})
					return
				}
			}

			// Apply discount on current phase price
			discountAmount := int(float64(phasePrice) * (discountPct / 100.0))
			finalPrice = phasePrice - discountAmount
		}

		// 3. Write pending registration (use ON CONFLICT to update details if the user registers again)
		var dbRegID string
		err = tx.QueryRow(
			`INSERT INTO vibecode_registrations (name, email, phone, status, coupon_code, amount_paid)
			 VALUES ($1, $2, $3, $4, $5, $6)
			 ON CONFLICT (email) DO UPDATE SET 
				name = EXCLUDED.name, 
				phone = EXCLUDED.phone, 
				coupon_code = EXCLUDED.coupon_code, 
				amount_paid = EXCLUDED.amount_paid
			 RETURNING id::text`,
			req.Name, req.Email, req.Phone, status, couponCode, finalPrice,
		).Scan(&dbRegID)

		if err != nil {
			log.Printf("Failed to register enrollment: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "No se pudo crear el registro."})
			return
		}
		regID = dbRegID
		tx.Commit()
	}

	// Create Mercado Pago mock redirect checkout URL
	// In production, you would call: https://api.mercadopago.com/checkout/preferences
	// And store the preference id. Here we generate a realistic-looking checkout link.
	prefID := fmt.Sprintf("pref_vibecode_%s_%d", regID, time.Now().Unix())
	checkoutURL := fmt.Sprintf("https://www.mercadopago.cl/checkout/v1/redirect?pref_id=%s", prefID)

	// Save preference ID in database for reference
	if db != nil {
		db.Exec("UPDATE vibecode_registrations SET mp_preference_id = $1 WHERE id = $2", prefID, regID)
	}

	res := EnrollResponse{
		RegistrationID: regID,
		CheckoutURL:    checkoutURL,
		AmountToPay:    finalPrice,
		Status:         status,
	}

	json.NewEncoder(w).Encode(res)
}

// Endpoint Webhook (Mercado Pago payment confirmations)
func webhookHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse preference/payment ID from MP payload
	type MPWebhook struct {
		Action string `json:"action"`
		Data   struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	var payload MPWebhook
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		// Fail silently to Mercado Pago to avoid retries on bad JSON format
		w.WriteHeader(http.StatusOK)
		return
	}

	// Log webhook received
	log.Printf("MP Webhook notification: Action=%s ID=%s", payload.Action, payload.Data.ID)

	// Look up preference ID and update status
	if db != nil && payload.Action == "payment.created" {
		// In production, call Mercado Pago API to verify payment details:
		// GET https://api.mercadopago.com/v1/payments/{payment_id}
		// Assuming payment is verified 'approved':
		
		// Update registration status to 'paid'
		// The SQL trigger `trg_verify_vibecode_seat` will automatically check total seats and block if >= 33!
		var regID string
		err := db.QueryRow(
			`UPDATE vibecode_registrations 
			 SET status = 'paid' 
			 WHERE id = (SELECT id FROM vibecode_registrations WHERE mp_preference_id = $1 OR mp_preference_id IS NOT NULL LIMIT 1)
			 RETURNING id::text`,
			payload.Data.ID,
		).Scan(&regID)
		
		if err != nil {
			log.Printf("❌ Failed updating payment status from webhook: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		
		// Trigger welcome email asynchronously via Next.js API
		go func(id string) {
			secret := os.Getenv("VERCEL_CRON_SECRET")
			if secret == "" {
				secret = "bfbad8fc5831ee549dea3ee90d5bcbfa9128763a90849f322bc9a2ed7a7b1eba"
			}
			
			postBody, marshalErr := json.Marshal(map[string]string{
				"reg_id": id,
				"secret": secret,
			})
			if marshalErr != nil {
				log.Printf("❌ Failed to marshal email request: %v", marshalErr)
				return
			}
			
			// Try localhost first, then production domain
			resp, postErr := http.Post("http://localhost:3000/api/vibecode/send-welcome", "application/json", bytes.NewBuffer(postBody))
			if postErr != nil {
				log.Printf("⚠️ Error triggering welcome email via localhost: %v. Retrying with production URL...", postErr)
				resp, postErr = http.Post("https://www.javiermujica.com/api/vibecode/send-welcome", "application/json", bytes.NewBuffer(postBody))
			}
			
			if postErr == nil {
				defer resp.Body.Close()
				log.Printf("📧 Welcome email API response status: %s", resp.Status)
			} else {
				log.Printf("❌ Failed to send welcome email for registration %s: %v", id, postErr)
			}
		}(regID)
		
		// Update coupon usage count if a coupon was used
		var couponCode sql.NullString
		db.QueryRow("SELECT coupon_code FROM vibecode_registrations WHERE mp_preference_id = $1 LIMIT 1", payload.Data.ID).Scan(&couponCode)
		if couponCode.Valid {
			db.Exec("UPDATE vibecode_coupons SET current_uses = current_uses + 1 WHERE code = $1", couponCode.String)
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// pprofAuthMiddleware protects standard profiling routes using basic token parameter checks
func pprofAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/debug/pprof") {
			token := r.URL.Query().Get("token")
			envToken := os.Getenv("PPROF_AUTH_TOKEN")
			if envToken == "" {
				envToken = "antigravity_secret_pprof" // secure fallback
			}
			if token != envToken {
				http.Error(w, "Unauthorized profiling request.", http.StatusUnauthorized)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

// Instagram Service & Webhook Handler
type InstagramService struct{}

func NewInstagramService() *InstagramService {
	return &InstagramService{}
}

type WebhookHandler struct {
	igService *InstagramService
}

func NewWebhookHandler(ig *InstagramService) *WebhookHandler {
	return &WebhookHandler{igService: ig}
}

func (h *WebhookHandler) Verify(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("hub.mode")
	token := r.URL.Query().Get("hub.verify_token")
	challenge := r.URL.Query().Get("hub.challenge")

	verifyToken := os.Getenv("INSTAGRAM_VERIFY_TOKEN")
	if verifyToken == "" {
		verifyToken = "vibecode_verify_token"
	}

	if mode == "subscribe" && token == verifyToken {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(challenge))
		return
	}
	http.Error(w, "Forbidden", http.StatusForbidden)
}

func (h *WebhookHandler) Webhook(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "received"})
}

func main() {
	initDB()

	// Cargar configuración e instanciar servicio de correo para alertas
	cfg := config.LoadConfig()
	emailService := services.NewEmailService(cfg)

	// Instanciar limitadores de tasa (Token Bucket Rate Limiters)
	// General (Lectura/Status): Ráfaga permisiva de 30 fichas, recarga de 1 token/segundo (60 req/minuto)
	generalLimiter := middleware.NewRateLimiter(30, 1.0, emailService)

	// Estricto (Escritura/Inscripción): Ráfaga de 5 fichas, recarga de 0.2 tokens/segundo (12 req/minuto)
	strictLimiter := middleware.NewRateLimiter(5, 0.2, emailService)

	// Use DefaultServeMux but wrap it with pprofAuthMiddleware for security
	mux := http.NewServeMux()

	// Preserved Audit Endpoint con protección estricta
	mux.HandleFunc("/api/v1/audit", middleware.WrapRateLimit(strictLimiter, auditHandler))

	// Vibecode Endpoints con Rate Limiting diferenciado
	mux.HandleFunc("/api/v1/vibecode/status", middleware.WrapRateLimit(generalLimiter, statusHandler))
	mux.HandleFunc("/api/v1/vibecode/enroll", middleware.WrapRateLimit(strictLimiter, enrollHandler))
	mux.HandleFunc("/api/v1/vibecode/webhook", webhookHandler)

	// Instagram Webhook Endpoint
	igService := NewInstagramService()
	igHandler := NewWebhookHandler(igService)
	mux.HandleFunc("/api/v1/instagram/webhook", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			igHandler.Verify(w, r)
		} else if r.Method == http.MethodPost {
			igHandler.Webhook(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Mount default pprof routes on custom mux by passing http.DefaultServeMux wrapped in auth
	mux.Handle("/debug/pprof/", pprofAuthMiddleware(http.DefaultServeMux))
	mux.Handle("/debug/pprof/cmdline", pprofAuthMiddleware(http.DefaultServeMux))
	mux.Handle("/debug/pprof/profile", pprofAuthMiddleware(http.DefaultServeMux))
	mux.Handle("/debug/pprof/symbol", pprofAuthMiddleware(http.DefaultServeMux))
	mux.Handle("/debug/pprof/trace", pprofAuthMiddleware(http.DefaultServeMux))

	log.Println("🚀 Go Backend listening on port :8080...")
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
