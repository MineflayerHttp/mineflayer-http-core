const handles = [
    '/createbot',
    '/bot/connect',
    '/bot/chat',
    '/bot/getevents'
]

export function load() {
    handles.forEach(val => require('./HttpApi' + val)());
}