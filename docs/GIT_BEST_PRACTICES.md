# Git Best Practices for Lambda Functions

## 🚨 **What NOT to Commit**

### **Never commit these files:**

- `node_modules/` - Dependencies (can be reinstalled with `npm install`)
- `*.zip` - Build artifacts (generated during deployment)
- `.env*` - Environment variables (may contain secrets)
- `package-lock.json` - Lock file (optional, but usually committed)

### **Always commit these files:**

- `package.json` - Dependency definitions
- `index.js` - Main Lambda function code
- `test.js` - Test files
- `README.md` - Documentation
- `deploy.sh` - Deployment scripts
- `*.json` - Configuration files (except package-lock.json)

## 🛡️ **Prevention Strategies**

### **1. Use .gitignore**

The `.gitignore` file in this directory already excludes:

```txt
node_modules/
contact-form-lambda.zip
.env*
*.log
```

### **2. Check before committing**

```bash
# Check what will be committed
git status

# Check for large files
git ls-files | xargs ls -lh | sort -k5 -hr | head -10

# Check for node_modules
git status | grep node_modules
```

### **3. Use specific file additions**

Instead of `git add .`, use:

```bash
# Add specific files
git add package.json index.js test.js README.md

# Or add by pattern
git add *.js *.md *.json
```

### **4. Use git add with patterns**

```bash
# Add all JS files
git add *.js

# Add all markdown files
git add *.md

# Add all JSON files except package-lock.json
git add *.json
git reset HEAD package-lock.json
```

## 🔧 **If You Accidentally Add node_modules**

### **Remove from staging:**

```bash
git reset HEAD node_modules/
```

### **Remove from git tracking:**

```bash
git rm -r --cached node_modules/
```

### **Add to .gitignore:**

```bash
echo "node_modules/" >> .gitignore
```

### **Commit the .gitignore:**

```bash
git add .gitignore
git commit -m "Add node_modules to .gitignore"
```

## 📋 **Recommended Workflow**

### **Before making changes:**

1. Check current status: `git status`
2. Review what's staged: `git diff --cached`

### **When adding files:**

1. Use specific file names: `git add package.json index.js`
2. Avoid `git add .` unless you're sure
3. Check what's staged: `git status`

### **Before committing:**

1. Review staged files: `git diff --cached --name-only`
2. Check file sizes: `git ls-files --cached | xargs ls -lh`
3. Look for unwanted files: `git status | grep -E "(node_modules|\.zip|\.log)"`

## 🚀 **Deployment Best Practices**

### **Build artifacts should be generated, not committed:**

```bash
# Generate zip file for deployment
npm run build:windows

# Deploy (zip file is generated, not committed)
./deploy_windows.sh
```

### **Environment variables:**

- Store in `.env` files (gitignored)
- Use AWS Lambda environment variables for production
- Never commit secrets or API keys

## 📚 **Useful Commands**

### **Check repository size:**

```bash
git count-objects -vH
```

### **Find large files:**

```bash
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort --numeric-sort --key=2 | tail -10
```

### **Clean up repository:**

```bash
# Remove untracked files
git clean -fd

# Remove untracked files and directories
git clean -fdx
```

## ✅ **Summary**

- **Never commit `node_modules/`** - It's huge and can be regenerated
- **Never commit `*.zip` files** - They're build artifacts
- **Always use `.gitignore`** - It prevents accidental commits
- **Be specific with `git add`** - Avoid `git add .` when possible
- **Review before committing** - Check `git status` and `git diff --cached`

Following these practices will keep your repository clean and prevent accidental commits of large files! 🎉
