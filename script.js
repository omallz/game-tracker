function displayData(data) {
    const container = document.getElementById('data-container');
    data.forEach(item => {
    const div = document.createElement('div');
    div.textContent = `Title: ${item.Title}, Genre: ${item.Genre}`;
    container.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://sheetdb.io/api/v1/x1xfo8ngykrhs?sheet=Backlog')
    .then(response => response.json())
    .then(data => {
        displayData(data);
    })
    .catch(error => console.error('Error:', error));
});