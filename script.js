// Evento del formulario
document.getElementById('requestForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const requests = document.getElementById('requests').value.split(',').map(Number);
    const head = parseInt(document.getElementById('head').value);
    const algorithm = document.getElementById('algorithm').value;

    const result = executeAlgorithm(algorithm, requests, head);
    displayResults(result, algorithm, head);
});

// Ejecución del algoritmo correspondiente
function executeAlgorithm(algorithm, requests, head) {
    const diskSize = 200; // Tamaño predeterminado del disco
    switch (algorithm) {
        case 'fifo': return fifo(requests, head);
        case 'sstf': return sstf(requests, head);
        case 'scan': return scan(requests, head, diskSize);
        case 'cscan': return cscan(requests, head, diskSize);
        case 'look': return look(requests, head);
        case 'clook': return clook(requests, head);
        default: throw new Error('Algoritmo no reconocido');
    }
}

// Mostrar resultados en el DOM
function displayResults(result, algorithm, initialHead) {

    const output = document.getElementById('output');

    output.innerHTML = `
        <h2>Resultados de ${algorithm.toUpperCase()
}</h2>
        <p>Promedio de movimientos: ${result.average}</p>

        <p>Orden de atención: ${result.order.join(', ')}</p>
        
<p>Movimientos: ${result.movements.join(', ')}</p>
    `;

    visualizeHeadMovement(result.order, initialHead, algorithm);

}

// Algoritmo FIFO
function fifo(requests, head) {
    let sum = 0, order = [], movements = [];
    requests.forEach((request, i) => {
        const move = i === 0 ? Math.abs(request - head) : Math.abs(request - requests[i - 1]);
        sum += move;
        movements.push(move);
        order.push(request);
    });

    return createResult(sum, order, movements);
}

// Algoritmo SSTF
function sstf(requests, head) {
    let order = [], movements = [], sum = 0;
    while (requests.length) {
        const closestIndex = requests.reduce((closest, req, idx) =>
            Math.abs(req - head) < Math.abs(requests[closest] - head) ? idx : closest, 0);
        const closestRequest = requests.splice(closestIndex, 1)[0];
        sum += Math.abs(head - closestRequest);
        movements.push(Math.abs(head - closestRequest));
        order.push(closestRequest);
        head = closestRequest;
    }

    return createResult(sum, order, movements);
}

// Algoritmo SCAN
function scan(requests, head, diskSize) {
    requests.sort((a, b) => a - b);
    let index = requests.findIndex(req => req >= head);
    let left = requests.slice(0, index).reverse();
    let right = requests.slice(index);

    let order = [...right, ...left];
    let movements = [];
    let sum = 0;

    order.forEach(request => {
        let move = Math.abs(head - request);
        movements.push(move);
        sum += move;
        head = request;
    });

    return createResult(sum, order, movements);
}

// Algoritmo CSCAN
function cscan(requests, head, diskSize) {
    requests.sort((a, b) => a - b);
    let index = requests.findIndex(req => req >= head);
    let left = requests.slice(0, index);
    let right = requests.slice(index);

    let order = [...right, diskSize - 1, 0, ...left];
    let movements = [];
    let sum = 0;

    order.forEach(request => {
        let move = Math.abs(head - request);
        movements.push(move);
        sum += move;
        head = request;
    });

    return createResult(sum, order, movements);
}

// Algoritmo LOOK
function look(requests, head) {
    requests.sort((a, b) => a - b);
    let index = requests.findIndex(req => req >= head);
    let left = requests.slice(0, index).reverse();
    let right = requests.slice(index);

    let order = [...right, ...left];
    let movements = [];
    let sum = 0;

    order.forEach(request => {
        let move = Math.abs(head - request);
        movements.push(move);
        sum += move;
        head = request;
    });

    return createResult(sum, order, movements);
}

// Algoritmo CLOOK
function clook(requests, head) {
    requests.sort((a, b) => a - b);
    let index = requests.findIndex(req => req >= head);
    let left = requests.slice(0, index);
    let right = requests.slice(index);

    let order = [...right, ...left];
    let movements = [];
    let sum = 0;

    order.forEach(request => {
        let move = Math.abs(head - request);
        movements.push(move);
        sum += move;
        head = request;
    });

    return createResult(sum, order, movements);
}

// Función auxiliar para resultados
function createResult(sum, order, movements) {
    return {
        average: (sum / order.length).toFixed(2),
        order: order,
        movements: movements,
    };
}


// Manejador común para algoritmos direccionados
function handleDirectionalAlgorithm(requests, head, diskSize, wrap, includeLimits) {
    requests.sort((a, b) => a - b);
    const index = requests.findIndex(req => req >= head);
    const left = requests.slice(0, index).reverse();
    const right = requests.slice(index);
    const order = includeLimits ? [...right, ...(wrap ? [diskSize - 1, 0] : []), ...left] : [...right, ...left];

    let movements = [], sum = 0;
    order.forEach(req => {
        sum += Math.abs(head - req);
        movements.push(Math.abs(head - req));
        head = req;
    });

    return createResult(sum, order, movements);
}

// Visualización del movimiento del cabezal
function visualizeHeadMovement(order, initialHead, algorithm) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxis(ctx, canvas);

    const scale = canvas.width / (Math.max(...order) + 10);

    drawRequests(ctx, order, scale);
    animateHeadMovement(ctx, order, scale, initialHead);
}

// Funciones auxiliares para resultados y visualización
function createResult(sum, order, movements) {
    return { average: (sum / order.length).toFixed(2), order, movements };
}

function drawAxis(ctx, canvas) {
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(canvas.width, 100);
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

function drawRequests(ctx, order, scale) {
    order.forEach(request => {
        const x = request * scale;
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, 80, 10, 10);
        ctx.fillText(request, x, 75);
    });
}

function animateHeadMovement(ctx, order, scale, initialHead) {
    let currentIndex = 0;
    const interval = setInterval(() => {
        if (currentIndex >= order.length) {
            clearInterval(interval);
            return;
        }
        ctx.clearRect(0, 0, 600, 200);
        drawAxis(ctx, ctx.canvas);
        drawRequests(ctx, order, scale);

        const x = order[currentIndex] * scale;
        ctx.fillStyle = 'red';
        ctx.fillRect(x, 60, 10, 10);
        ctx.fillText('Cabezal', x, 55);

        currentIndex++;
    }, 1000);
}
