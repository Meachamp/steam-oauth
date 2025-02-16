function strSanitize(str) {
    if(typeof(str) === 'string') {
        return str
    }

    return ''
}

export {strSanitize}
