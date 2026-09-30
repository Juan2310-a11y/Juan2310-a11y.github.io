const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = '178c6fc778ccc68e1d6a'; // GitHub CLI client ID
const REPO_OWNER = 'Juan2310-a11y';
const REPO_NAME = 'Juan2310-a11y.github.io';

function post(url, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'Antigravity-AutoDeploy'
            }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Iniciando vinculacion automatica con GitHub...');
    
    // 1. Obtener device code
    const authReq = await post('https://github.com/login/device/code', {
        client_id: CLIENT_ID,
        scope: 'repo'
    });

    if (!authReq.user_code) {
        console.error('Error al obtener codigo de GitHub:', authReq);
        process.exit(1);
    }

    console.log('\n======================================================');
    console.log(`CODIGO DE AUTORIZACION: ${authReq.user_code}`);
    console.log(`ENLACE PARA AUTORIZAR:  ${authReq.verification_uri}`);
    console.log('======================================================\n');

    // Escribir el estado a un archivo de control para que el asistente lo lea y se lo dé al usuario
    fs.writeFileSync(path.join(__dirname, 'auth_code.json'), JSON.stringify(authReq, null, 2));

    // Abrir automáticamente el navegador en la página de login
    try {
        execSync(`powershell Start-Process "${authReq.verification_uri}"`);
    } catch (e) {}

    // 2. Sondear hasta que el usuario apruebe
    console.log('Esperando aprobacion en el navegador...');
    let token = null;
    const intervalMs = (authReq.interval || 5) * 1000;

    while (!token) {
        await new Promise(r => setTimeout(r, intervalMs));
        const tokenRes = await post('https://github.com/login/oauth/access_token', {
            client_id: CLIENT_ID,
            device_code: authReq.device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        });

        if (tokenRes.access_token) {
            token = tokenRes.access_token;
            console.log('¡Autorizacion recibida con exito!');
        } else if (tokenRes.error === 'authorization_pending') {
            process.stdout.write('.');
        } else if (tokenRes.error === 'slow_down') {
            await new Promise(r => setTimeout(r, 5000));
        } else {
            console.error('\nError en autorizacion:', tokenRes.error_description || tokenRes.error);
            process.exit(1);
        }
    }

    // 3. Subir código a GitHub usando el token
    console.log('\nSubiendo archivos al repositorio GitHub...');
    const authedUrl = `https://x-access-token:${token}@github.com/${REPO_OWNER}/${REPO_NAME}.git`;
    
    try {
        execSync(`git remote set-url origin "${authedUrl}"`, { cwd: __dirname });
        execSync(`git push -u origin main --force`, { cwd: __dirname, stdio: 'inherit' });
        console.log('\n¡SUBIDA COMPLETADA CON EXITO!');
    } catch (err) {
        console.error('Error al subir con git:', err.message);
    } finally {
        // Restaurar URL limpia sin exponer token en git config
        execSync(`git remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"`, { cwd: __dirname });
        // Limpiar archivo temporal
        if (fs.existsSync(path.join(__dirname, 'auth_code.json'))) {
            fs.unlinkSync(path.join(__dirname, 'auth_code.json'));
        }
    }
}

main().catch(err => {
    console.error('Fallo en la ejecucion:', err);
    process.exit(1);
});
