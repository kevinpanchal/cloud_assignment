provider "google" {
  credentials = "./cloud-project-389920-786f7b6e6774.json"
  project     = "cloud-project-389920"
  region      = "us-central1"
}

resource "google_container_cluster" "my_cluster" {
  name               = "a3-cluster"
  location           = "us-central1"
  initial_node_count = 1

  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  node_config {
    preemptible  = false
    machine_type = "e2-medium"
    disk_size_gb = 30

    image_type = "COS_CONTAINERD"

    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
