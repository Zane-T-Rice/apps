resource "aws_s3_bucket" "zanesworld_apps_bucket" {
  bucket = "zanesworld-apps"
}

resource "aws_s3_bucket_ownership_controls" "bucket_ownership_controls" {
  bucket = aws_s3_bucket.zanesworld_apps_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket                  = aws_s3_bucket.zanesworld_apps_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "public_read_s3" {
  statement {
    sid    = "AllowS3Access"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject",
    ]
    resources = [
      aws_s3_bucket.zanesworld_apps_bucket.arn,
      "${aws_s3_bucket.zanesworld_apps_bucket.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "public_read_s3" {
  bucket = aws_s3_bucket.zanesworld_apps_bucket.id
  policy = data.aws_iam_policy_document.public_read_s3.json
}

resource "aws_s3_bucket_website_configuration" "zanesworld_apps_website_configuration" {
  bucket = aws_s3_bucket.zanesworld_apps_bucket.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_object" "directory_files" {
  for_each = fileset("${path.module}/../../out", "**/*")

  bucket = aws_s3_bucket.zanesworld_apps_bucket.id
  key    = each.value
  source = "${path.module}/../../out/${each.value}"
  etag   = filemd5("${path.module}/../../out/${each.value}") # Optional: for content change detection
  content_type = "text/html"
}