variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "us-east-1"
}

variable "site_bucket_name" {
  description = "Name of the S3 bucket the site is uploaded to. S3 bucket names are global, so pick your own."

  type = string
}
