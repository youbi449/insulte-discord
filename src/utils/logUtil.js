const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const ERROR_LOG_FILE = path.join(LOGS_DIR, 'errors.log');

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Log une erreur dans logs/errors.log avec timestamp, message et stack
 * @param {string} message
 * @param {Error} error
 */
function logError(message, error) {
  ensureLogsDir();
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}: ${error && error.stack ? error.stack : error}\n`;
  fs.appendFile(ERROR_LOG_FILE, logLine, err => {
    if (err) {
      // Si on ne peut pas logger, on tente de logger sur la sortie standard
      try {
        process.stderr.write(`[${timestamp}] Erreur lors de l'écriture du log d'erreur: ${err}\n`);
      } catch {}
    }
  });
}

module.exports = { logError }; 