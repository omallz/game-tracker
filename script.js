// Function to fetch game data from SheetDB
async function fetchSheetdbData() {
    try {
        const response = await fetch('https://gaming-backlog-proxy-server-abba15e1c367.herokuapp.com/proxy.php?api=sheetdb');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data from SheetDB:', error);
    }
}

// Function to fetch game data from IGDB with pagination
async function fetchIgdbData(gameTitle) {
    try {
        const encodedTitle = encodeURIComponent(gameTitle);
        const response = await fetch(`https://gaming-backlog-proxy-server-abba15e1c367.herokuapp.com/proxy.php?api=igdb&search=${encodedTitle}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log('IGDB Data for', gameTitle, data); // Log the IGDB data

        if (!data || data.length === 0) {
            console.log(`No data found for "${gameTitle}". Trying alternative queries.`);
            // Optionally, try a simplified query or different format
            const altTitle = gameTitle.replace(':', '');
            const altResponse = await fetch(`https://gaming-backlog-proxy-server-abba15e1c367.herokuapp.com/proxy.php?api=igdb&search=${encodeURIComponent(altTitle)}`);
            const altData = await altResponse.json();
            console.log('IGDB Data for alternative title', altTitle, altData);
            return altData;
        }

        return data;
    } catch (error) {
        console.error('Error fetching data from IGDB:', error);
    }
}

// Function to create game cards with placeholder images
function createGameCards(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear previous data
    container.classList.add('row', 'g-3', 'row-cols-2', 'row-cols-md-4');

    for (const item of data) {
        const gameCol = document.createElement('div');
        gameCol.classList.add('col');

        const gameCard = document.createElement('div');
        gameCard.classList.add('card', 'h-100');

        const gameCardBody = document.createElement('div');
        gameCardBody.classList.add('card-body');

        /* image */
        const img = document.createElement('img');
        img.src = 'https://via.placeholder.com/200x300?text=Loading...'; // Placeholder image URL
        img.alt = `${item.gameTitle} cover image`;
        img.setAttribute('data-title', item.gameTitle); // Add data-title attribute
        img.classList.add('card-img-top', 'game-image');
        img.loading = 'lazy'; // Enable lazy loading

        /* game title */
        const gameCardTitle = document.createElement('h5');
        gameCardTitle.classList.add('card-title');
        gameCardTitle.textContent = `${item.gameTitle}`;

        /* added to gamepass */
        const gameAddedDate = document.createElement('p');
        gameAddedDate.classList.add('card-text');
        const date = new Date(item.gamepassAddDate + '-01'); // Add day to create a valid date
        const formattedDate = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        gameAddedDate.innerHTML = `<i class="fa-regular fa-calendar-plus fa-fw"></i> ${formattedDate}`;

        // Calculate the difference in months
        const currentDate = new Date();
        const diffTime = currentDate - date;
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

        // Apply background colors based on the difference in months
        if (diffMonths >= 10) {
            gameCard.style.backgroundColor = '#f3a7ae'; // 10 months or more
        } else if (diffMonths >= 6) {
            gameCard.style.backgroundColor = '#fff3cd'; // 6 months or more
        } else {
            gameCard.style.backgroundColor = '#bcd7ca'; // recent
        }

        /* Add the card, image and card-body */
        gameCol.appendChild(gameCard);
        gameCard.appendChild(img);
        gameCard.appendChild(gameCardBody);

        /* Add the content of card-body */
        gameCardBody.appendChild(gameCardTitle);
        gameCardBody.appendChild(gameAddedDate);
        container.appendChild(gameCol);
    }
}

// Function to update images in batches with rate limiting
async function updateImagesInBatches(data, batchSize = 8, delayMs = 250) {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        for (const item of batch) {
            const img = document.querySelector(`img[data-title="${item.gameTitle.replace(/"/g, '\\"')}"]`);
            if (img) {
                const igdbData = await fetchIgdbData(item.gameTitle);
                if (igdbData && igdbData.length > 0) {
                    if (igdbData[0].cover) {
                        // Modify the cover URL to specify the width
                        const coverUrl = igdbData[0].cover.url.replace('t_thumb', 't_cover_big'); // Example size
                        img.src = coverUrl;
                    }
                }
            }
        }
        await delay(delayMs); // Delay between batches to respect rate limits
    }
}

// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchSheetdbData().then(data => {
        if (data) {
            createGameCards(data);
            updateImagesInBatches(data);
        }
    }).catch(error => console.error('Error:', error));
});
