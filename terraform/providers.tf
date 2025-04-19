terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "aws" {
  region = local.region

  # Add longer timeouts for EKS operations
  default_tags {
    tags = local.tags
  }

  # Increase timeouts for API operations
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_credentials_validation = true

  # Configure retries for API throttling
  retry_mode = "standard"

  # Configure the maximum number of retries (increased)
  max_retries = 10
}

provider "random" {}