package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"v0-jm/internal/config"
)

type EmailService struct {
	cfg *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{cfg: cfg}
}

type ResendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

func (s *EmailService) sendEmail(to string, subject string, html string) error {
	if s.cfg.ResendAPIKey == "" {
		log.Printf("⚠️ Resend API Key is missing. Email simulation to %s: '%s'", to, subject)
		return nil
	}

	payload := ResendEmailPayload{
		From:    s.cfg.EmailFrom,
		To:      []string{to},
		Subject: subject,
		HTML:    html,
	}

	if payload.From == "" {
		payload.From = "Javier Mujica <hola@javiermujica.com>"
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error marshaling email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("error creating email request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error executing email request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("resend API returned status code %d", resp.StatusCode)
	}

	log.Printf("📧 Email successfully sent via Resend to %s: '%s'", to, subject)
	return nil
}

// SendBotAlertEmail envía una alerta administrativa por correo electrónico cuando se detecta alta frecuencia/bot.
func (s *EmailService) SendBotAlertEmail(ip string, endpoint string, userAgent string, requestCount int) {
	recipient := s.cfg.AdminEmail
	if recipient == "" {
		recipient = "admin@javiermujica.com"
	}

	subject := fmt.Sprintf("🚨 ALERTA SEGURIDAD: Actividad de Bot Detectada (IP: %s)", ip)
	nowStr := time.Now().Format("02-01-2006 15:04:05 MST")

	if userAgent == "" {
		userAgent = "Desconocido / No provisto (Petición sospechosa sin User-Agent)"
	}

	html := fmt.Sprintf(`
		<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #1E293B; background-color: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0;">
			<div style="background-color: #EF4444; padding: 12px 20px; border-radius: 6px; margin-bottom: 20px;">
				<h2 style="color: #FFFFFF; margin: 0; font-size: 18px; font-weight: 600;">🚨 ALERTA DE SEGURIDAD - BOT DETECTADO</h2>
			</div>

			<p>Hola Administrator,</p>
			<p>El sistema de mitigación de tráfico de <strong>Javier Mujica Consultoría / Vibecode</strong> ha frenado y mitigado una ráfaga anómala de peticiones identificada como posible bot o scanner de red.</p>
			
			<div style="margin: 20px 0; padding: 18px; border-left: 4px solid #EF4444; background-color: #FFFFFF; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
				<table style="width: 100%%; border-collapse: collapse; font-size: 14px;">
					<tr>
						<td style="padding: 6px 0; font-weight: bold; width: 140px; color: #475569;">Dirección IP:</td>
						<td style="padding: 6px 0; color: #0F172A; font-family: monospace; font-size: 15px;">%s</td>
					</tr>
					<tr>
						<td style="padding: 6px 0; font-weight: bold; color: #475569;">Ruta / Endpoint:</td>
						<td style="padding: 6px 0; color: #0F172A; font-family: monospace;">%s</td>
					</tr>
					<tr>
						<td style="padding: 6px 0; font-weight: bold; color: #475569;">Frecuencia Peticiones:</td>
						<td style="padding: 6px 0; color: #DC2626; font-weight: bold;">%d peticiones bloqueadas</td>
					</tr>
					<tr>
						<td style="padding: 6px 0; font-weight: bold; color: #475569;">User-Agent (Firma):</td>
						<td style="padding: 6px 0; color: #334155; font-size: 13px;">%s</td>
					</tr>
					<tr>
						<td style="padding: 6px 0; font-weight: bold; color: #475569;">Fecha y Hora:</td>
						<td style="padding: 6px 0; color: #475569;">%s</td>
					</tr>
				</table>
			</div>

			<div style="background-color: #FEF2F2; padding: 14px 18px; border-radius: 6px; border: 1px solid #FCA5A5; margin-bottom: 20px;">
				<h4 style="margin: 0 0 8px 0; color: #991B1B;">🛡️ Medidas Tomadas Automáticamente:</h4>
				<ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 13px;">
					<li>Se respondió con código de bloqueo temporal <strong>HTTP 429 Too Many Requests</strong>.</li>
					<li>Se activó la recarga obligatoria de cuota mediante el algoritmo Token Bucket.</li>
					<li>Esta alerta por correo ha sido silenciada durante los próximos 15 minutos para esta IP para prevenir sobrecarga en tu correo.</li>
				</ul>
			</div>

			<p style="font-size: 12px; color: #94A3B8; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 12px;">
				Mensaje automático generado por el Middleware de Seguridad y Mitigación de Antigravity.
			</p>
		</div>
	`, ip, endpoint, requestCount, userAgent, nowStr)

	if err := s.sendEmail(recipient, subject, html); err != nil {
		log.Printf("❌ Error sending bot alert email to %s: %v", recipient, err)
	}
}

