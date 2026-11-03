package config

import (
	"os"
)

type Config struct {
	Port               string
	DatabaseURL        string
	SupabaseURL        string
	SupabaseAnonKey    string
	ResendAPIKey       string
	EmailFrom          string
	AdminEmail         string
	MercadoPagoToken   string
	MercadoPagoPubKey  string
	FlowAPIKey         string
	FlowSecret         string
	FlowURL            string
	WebpayCommerceCode string
	WebpayAPIKey       string
	WebpayEnv          string // "sandbox" or "production"
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("POSTGRES_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DATABASE_URL")
	}

	return &Config{
		Port:               port,
		DatabaseURL:        dbURL,
		SupabaseURL:        os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey:    os.Getenv("SUPABASE_ANON_KEY"),
		ResendAPIKey:       os.Getenv("RESEND_API_KEY"),
		EmailFrom:          os.Getenv("EMAIL_FROM"),
		AdminEmail:         os.Getenv("ADMIN_EMAIL"),
		MercadoPagoToken:   os.Getenv("MERCADO_PAGO_ACCESS_TOKEN"),
		MercadoPagoPubKey:  os.Getenv("NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY"),
		FlowAPIKey:         os.Getenv("FLOW_API_KEY"),
		FlowSecret:         os.Getenv("FLOW_SECRET"),
		FlowURL:            os.Getenv("FLOW_URL"), // e.g. https://sandbox.flow.cl/api
		WebpayCommerceCode: os.Getenv("WEBPAY_COMMERCE_CODE"),
		WebpayAPIKey:       os.Getenv("WEBPAY_API_KEY"),
		WebpayEnv:          os.Getenv("WEBPAY_ENV"), // "sandbox" or "production"
	}
}
