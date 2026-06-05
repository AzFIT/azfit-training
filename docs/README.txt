AZFIT GITHUB PAGES — BUILT DOCS FOLDER
=======================================

This is the BUILT output (dist/ → docs/) for GitHub Pages deployment.

UPLOAD INSTRUCTIONS:
1. Go to https://github.com/AzFIT/azfit-training
2. Delete the ENTIRE existing docs/ folder
3. Upload ALL files from this ZIP into a new docs/ folder
4. Commit with message: "Deploy: AI Chat + Settings + built output"
5. GitHub Pages will update https://azfit.fit/ within 2 minutes

IMPORTANT: You must replace the ENTIRE docs/ folder, not just individual files.
The old docs/ was built on May 22 and is missing AI Chat + Settings features.

ALTERNATIVE: Run this locally after uploading the 3 source files:
  npm run build
  rm -rf docs/*
  cp -r dist/* docs/
  git add docs/
  git commit -m "Deploy built output"
  git push origin main
