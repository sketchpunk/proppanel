import css from 'rollup-plugin-css-only'

export default{
    input   : './src/main.js',
    
    watch   : {
        include     : './src/**',
        clearScreen : false
    },

    output  : {
        file        : './dist/bundle.js',
        format      : 'es',
        sourcemap   : false
    },

    plugins: [ css({ output: 'bundle.css' }) ]
}