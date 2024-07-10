# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "api_port" {
  type = number
}

variable "supabase_url" {
  type = string
}

variable "supabase_key" {
  type = string
}

variable "database_url" {
  type = string
}

variable "cors_address" {
  type = string
}
