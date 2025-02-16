import {URL, URLSearchParams} from 'url';
import {strSanitize} from './utils.mjs'
import fetch from 'node-fetch';

function generate_redirect(base, path) {
    let params = {
        'openid.ns': "http://specs.openid.net/auth/2.0",
        'openid.identity': "http://specs.openid.net/auth/2.0/identifier_select",
        'openid.claimed_id': "http://specs.openid.net/auth/2.0/identifier_select",
        'openid.mode': "checkid_setup",
        'openid.realm': base,
        'openid.return_to': new URL(path, base).href,
    }

    let redir_url = new URL('https://steamcommunity.com/openid/login')
    redir_url.search = new URLSearchParams(params);

    return redir_url.toString();
}

async function verify_id(params) {
    let sanitized_params = {
        'openid.ns': strSanitize(params['openid.ns']),
        'openid.mode': 'check_authentication',
        'openid.op_endpoint': strSanitize(params['openid.op_endpoint']),
        'openid.claimed_id': strSanitize(params['openid.claimed_id']),
        'openid.identity': strSanitize(params['openid.identity']),
        'openid.return_to': strSanitize(params['openid.return_to']),
        'openid.response_nonce': strSanitize(params['openid.response_nonce']),
        'openid.assoc_handle': strSanitize(params['openid.assoc_handle']),
        'openid.signed': strSanitize(params['openid.signed']),
        'openid.sig': strSanitize(params['openid.sig'])
    }

    return fetch('https://steamcommunity.com/openid/login', {
        method: 'POST',
        body: new URLSearchParams(sanitized_params),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    }).then(res => {
        return res.text()
    }).then(data => {
        let fields = data.split('\n')
        let valid = false;

        fields.forEach((val) => {
            let components = val.split(':')
            let k = components[0]
            let v = components[1]

            if (k === 'is_valid' && v === 'true') {
                valid = true;
            }
        })

        if(valid) {
            let claim = sanitized_params['openid.claimed_id'];
            return {
                success: true,
                steamid: claim.slice(claim.lastIndexOf('/')+1)
            }
        }

        return {
            success: false
        }
    }).catch(e => {
        return {
            success: false
        }
    })
}

export default {verify_id, generate_redirect}
