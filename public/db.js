// this file creates the object for the DB
let db
// the 1 has ?may have something to do with the V of the DB
const request = indexedDb.open('budget', 1)

request.onupgradeneeded = event => {
    db = event.target.result
    db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = event => {
    db = event.target.result

    if (navigator.onLine) {
        checkDatabase()
    }
}

request.onerror = event => {
    console.log(event.target.errorCode)
}

const saveRecord = item => {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.createObjectStore('pending')
    store.add(item)
}

const checkDatabase = () => {
    console.log('checking database')
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.createObjectStore('pending')
    const getAll = store.getAll()

getAll.onSuccess = () => {
    if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
                Authorization: `Bearer ${local.storage.getItem('user')}`
            },
            body: JSON.stringify(getAll.result)
            })
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite')
                const store = transaction.createObjectStore('pending')
                store.clear()
            })
        }
    }
}

window.addEventListener('online', checkDatabase)