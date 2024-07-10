# ---------------------------------------------
# App Runner - IAMロール
# ---------------------------------------------
resource "aws_iam_role" "apprunner_access_role" {
  name = "${var.project}-${var.environment}-apprunner-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : ["build.apprunner.amazonaws.com", "tasks.apprunner.amazonaws.com"]
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}

# ---------------------------------------------
# App Runner - IAMロールポリシー
# ---------------------------------------------
resource "aws_iam_role_policy" "apprunner_access_policy" {
  role = aws_iam_role.apprunner_access_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups",
          "sts:AssumeRole",
          "ecr:GetAuthorizationToken",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "apprunner:DescribeService",
          "apprunner:ListServices",
          "apprunner:ListTagsForResource",
          "apprunner:TagResource",
          "apprunner:UntagResource",
          "apprunner:UpdateService"
        ]
        Resource = "*"
      }
    ]
  })
}

# ---------------------------------------------
# App Runner - サービス
# ---------------------------------------------
resource "aws_apprunner_service" "back_travel_service" {
  service_name = "${var.project}-${var.environment}-service"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.hono_back_travel_app.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = var.api_port

        runtime_environment_variables = {
          SUPABASE_URL = var.supabase_url
          SUPABASE_KEY = var.supabase_key
          DATABASE_URL = var.database_url
          CORS_ADDRESS = var.cors_address
          PORT         = var.api_port
        }
      }
    }
  }

  instance_configuration {
    cpu               = "1024"
    memory            = "2048"
    instance_role_arn = aws_iam_role.apprunner_access_role.arn
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  depends_on = [aws_iam_role_policy.apprunner_access_policy]
}
