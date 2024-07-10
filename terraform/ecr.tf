# ---------------------------------------------
# ECR Repository
# ---------------------------------------------
resource "aws_ecr_repository" "hono_back_travel_app" {
  name                 = "hono-back-travel-app"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

output "repository_url" {
  value = aws_ecr_repository.hono_back_travel_app.repository_url
}
