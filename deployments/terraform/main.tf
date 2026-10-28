// NOTE:
//
// The S3 bucket that stores the terraform state has to be created
// manually before the first apply. See terraform.tf.

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      zanesworld = "apps"
    }
  }
}

