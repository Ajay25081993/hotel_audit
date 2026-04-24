#!/usr/bin/env python3
"""
Integration setup script
Updates frontend to work with Python backend
"""

import json
import os
import subprocess
import sys

def update_frontend_config():
    """Update frontend configuration to use Python backend"""
    print("�� Updating frontend configuration...")
    
    # Update the package.json scripts to proxy to Python backend
    try:
        with open('package.json', 'r') as f:
            package_json = json.load(f)
        
        # Update the dev script to start both servers
        if 'scripts' not in package_json:
            package_json['scripts'] = {}
        
        package_json['scripts']['dev:backend'] = "cd python_backend && python start_server.py"
        package_json['scripts']['dev:frontend'] = "vite"
        package_json['scripts']['dev:full'] = "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
        
        # Add proxy configuration for development
        package_json['proxy'] = "http://localhost:8000"
        
        with open('package.json', 'w') as f:
            json.dump(package_json, f, indent=2)
        
        print("✅ Updated package.json")
        
    except Exception as e:
        print(f"❌ Failed to update package.json: {e}")

def create_env_file():
    """Create .env file for frontend"""
    print("🔧 Creating frontend .env file...")
    
    env_content = """VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
"""
    
    try:
        with open('client/.env', 'w') as f:
            f.write(env_content)
        print("✅ Created client/.env file")
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")

def update_api_client():
    """Update frontend API client to use Python backend"""
    print("🔧 Updating API client configuration...")
    
    api_config = '''// API Configuration for Python Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// API client with authentication
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Properties
  async getProperties() {
    return this.request('/properties');
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  // Audits
  async getAudits(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/audits?${searchParams}`);
  }

  async getAudit(id) {
    return this.request(`/audits/${id}`);
  }

  async createAudit(auditData) {
    return this.request('/audits', {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
  }

  async updateAudit(id, updateData) {
    return this.request(`/audits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async getAuditItems(auditId) {
    return this.request(`/audits/${auditId}/items`);
  }

  async createAuditItem(auditId, itemData) {
    return this.request(`/audits/${auditId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateAuditItem(itemId, updateData) {
    return this.request(`/audits/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // AI Features
  async analyzePhoto(imageData, context) {
    return this.request('/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData, context }),
    });
  }

  async suggestScore(itemDescription, comments, photos = []) {
    return this.request('/ai/suggest-score', {
      method: 'POST',
      body: JSON.stringify({
        item_description: itemDescription,
        comments,
        photos,
      }),
    });
  }

  async generateReport(auditId, includeActionPlan = true) {
    return this.request(`/ai/generate-report/${auditId}`, {
      method: 'POST',
      body: JSON.stringify({ include_action_plan: includeActionPlan }),
    });
  }

  async getAuditInsights(auditId) {
    return this.request(`/ai/insights/${auditId}`);
  }

  async updateItemAI(itemId) {
    return this.request(`/ai/update-item-ai/${itemId}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
'''
    
    try:
        os.makedirs('client/src/lib', exist_ok=True)
        with open('client/src/lib/api.js', 'w') as f:
            f.write(api_config)
        print("✅ Created API client")
    except Exception as e:
        print(f"❌ Failed to create API client: {e}")

def install_dependencies():
    """Install additional dependencies"""
    print("📦 Installing additional dependencies...")
    
    try:
        # Install concurrently for running both servers
        subprocess.run(['npm', 'install', 'concurrently', '--save-dev'], check=True)
        print("✅ Installed concurrently")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")

def main():
    print("🚀 Setting up frontend-backend integration...")
    
    update_frontend_config()
    create_env_file()
    update_api_client()
    install_dependencies()
    
    print("\n🎉 Integration setup completed!")
    print("\n📋 Next steps:")
    print("1. Install Python dependencies: cd python_backend && pip install -r ../requirements.txt")
    print("2. Set up PostgreSQL database")
    print("3. Start the integrated development servers: npm run dev:full")
    print("\n🔑 API Documentation will be available at: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
