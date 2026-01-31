# 🚀 Quick Start Guide (CachyOS/Arch Linux)

## 🎯 Start Everything

### 1. Start Database
```bash
sudo systemctl start mariadb
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
python main.py
```
**Backend runs at**: http://localhost:8000

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
**Frontend runs at**: http://localhost:5173

---

## 🛑 Stop Everything

```bash
# Stop backend
pkill -f "python main.py"

# Stop frontend
pkill -f "vite"

# Stop database
sudo systemctl stop mariadb
```

---

## � Access the Application

**Main App**: http://localhost:5173

**API Docs**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## � First Time Setup (Already Done!)

<details>
<summary>Click to expand setup instructions</summary>

### Install MariaDB
```bash
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable mariadb
sudo systemctl start mariadb
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database (.env file)
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=industrial_safety
DB_USER=root
DB_PASSWORD=
EOF

# Train ML models
python train_models.py
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Install Node.js (if needed)
```bash
sudo pacman -S nodejs npm
```

</details>

---

**That's it! You're ready to go! 🎉**
