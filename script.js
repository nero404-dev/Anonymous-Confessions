import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyARi94wDaTrcRVBR4DQa2DDjIEq1qoYbtQ",
    authDomain: "anonymous-confessions-404.firebaseapp.com",
    projectId: "anonymous-confessions-404",
    storageBucket: "anonymous-confessions-404.firebasestorage.app",
    messagingSenderId: "135307543751",
    appId: "1:135307543751:web:cdb5dcf624dafad3636ae2"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

window.addToArray = function () {
    const inputElement = document.getElementById('userInput');
    const inputValue = inputElement.value.trim();

    if (inputValue !== '') {
        const now = new Date();
        const timestamp = now.toISOString();

        const newItemRef = push(ref(database, 'userArray'));
        set(newItemRef, {
            text: inputValue,
            timestamp: timestamp
        })
            .then(() => {
                console.log('Data successfully written');
                inputElement.value = '';
            })
            .catch((error) => {
                console.error('Write failed', error);
            });
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

window.filterMessagesByTime = function () {
    const selectedTime = document.getElementById('timeFilter').value;
    fetchArrayItems(selectedTime);
}

function fetchArrayItems(filterTime = 'all') {
    const arrayRef = ref(database, 'userArray');
    onValue(arrayRef, (snapshot) => {
        const displayElement = document.getElementById('arrayDisplay');
        displayElement.innerHTML = '';

        const data = snapshot.val();
        const now = new Date();
        let timeLimitStart, timeLimitEnd;

        if (filterTime === '1') {
            timeLimitEnd = now; // Now
            timeLimitStart = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)); // 1 Day Ago
        } else if (filterTime === '10') {
            timeLimitEnd = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)); // 1 Day Ago
            timeLimitStart = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 Days Ago
        } else if (filterTime === '30') {
            timeLimitEnd = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 Days Ago
            timeLimitStart = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 Month Ago
        } else if (filterTime === '180') {
            timeLimitEnd = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 Month Ago
            timeLimitStart = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)); // 6 Months Ago
        } else if (filterTime === '365') {
            timeLimitEnd = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)); // 6 Months Ago
            timeLimitStart = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 Year Ago
        } else if (filterTime === 'before365') {
            timeLimitStart = new Date(0); // Beginning of time
            timeLimitEnd = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 Year Ago
        }

        let hasMessages = false; // 👈 flag

        if (data) {
            Object.entries(data)
                .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
                .forEach(([key, item]) => {
        
                    const itemDate = new Date(item.timestamp);
        
                    if (filterTime === 'all' || (itemDate >= timeLimitStart && itemDate < timeLimitEnd)) {
        
                        hasMessages = true;
        
                        // MESSAGE BLOCK (container)
                        const messageBlock = document.createElement('div');
                        messageBlock.className = 'message-block';
        
                        // MESSAGE ROW
                        const itemRow = document.createElement('div');
                        itemRow.className = 'item-row';
        
                        const itemText = document.createElement('span');
                        itemText.textContent = item.text;
        
                        const timeInfo = document.createElement('div');
                        timeInfo.className = 'timestamp';
                        timeInfo.textContent = formatDate(item.timestamp);
        
                        itemRow.appendChild(itemText);
                        itemRow.appendChild(timeInfo);
        
                        messageBlock.appendChild(itemRow);
        
                        // REPLIES CONTAINER
                        const replyContainer = document.createElement('div');
                        replyContainer.className = 'reply-container';
        
                        // SHOW REPLIES IF THEY EXIST
                        if (item.replies) {
                            Object.entries(item.replies)
                                .sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp))
                                .forEach(([replyId, reply]) => {
        
                                    const replyRow = document.createElement('div');
                                    replyRow.className = 'reply-row';
        
                                    const replyText = document.createElement('span');
                                    replyText.textContent = reply.text;
        
                                    const replyTime = document.createElement('div');
                                    replyTime.className = 'timestamp';
                                    replyTime.textContent = formatDate(reply.timestamp);
        
                                    replyRow.appendChild(replyText);
                                    replyRow.appendChild(replyTime);
        
                                    replyContainer.appendChild(replyRow);
        
                                });
                        }
                        
                        // REPLY INPUT
                        const replyInput = document.createElement('input');
                        replyInput.placeholder = "Reply...";
                        replyInput.id = `replyInput-${key}`;
        
                        const replyButton = document.createElement('button');
                        replyButton.textContent = "Reply";
                        replyButton.onclick = () => addReply(key);
        
                        replyContainer.appendChild(replyInput);
                        replyContainer.appendChild(replyButton);
        
                        messageBlock.appendChild(replyContainer);
        
                        // ADD WHOLE BLOCK TO DISPLAY
                        displayElement.appendChild(messageBlock);
        
                    }
        
                });
        }

        // 👇 Show message if nothing was displayed
        if (!hasMessages) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'no-messages';
            emptyMessage.textContent = 'No messages yet...';
            emptyMessage.style.color = 'var(--grey-3)';
            displayElement.appendChild(emptyMessage);
        }

    }, (error) => {
        console.error('Read failed', error);
    });
}

function checkAccess() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Define the time range for access (9:00 PM to 6:00 AM)
    const startAccessTime = 21 * 60; // 9:00 PM in minutes
    const endAccessTime = 6 * 60; // 6:00 AM in minutes

    // Check if current time is within access hours
    if (currentTime >= startAccessTime || currentTime < endAccessTime) {
        // Access granted
        document.getElementById('messageArea').style.display = 'block';
        document.getElementById('accessDenied').style.display = 'none';
        
        // Set background for normal access
        document.body.style.backgroundColor = ''; // Reset background color
        document.documentElement.style.backgroundColor = 'var(--dark-bg)'; // Set dark background
        document.documentElement.style.backgroundImage = "url('pictures/egor-litvinov-IdsKb3VYRcY-unsplash-horizontal.jpg')"; // Set background image
        document.documentElement.style.backgroundRepeat = 'no-repeat'; // Ensure no repeat
        document.documentElement.style.backgroundSize = 'cover'; // Cover the entire area
        
        // Fetch messages with the 'all' filter
        fetchArrayItems('all'); // Fetch messages if access is granted
    } else {
        // Access denied
        document.getElementById('messageArea').style.display = 'none'; // Hide message area
        document.getElementById('accessDenied').style.display = 'block'; // Show access denied message
        
        // Set background for access denied
        document.body.style.backgroundColor = ''; // Reset background color
        document.documentElement.style.backgroundColor = 'var(--dark-bg)'; // Set dark background
        document.documentElement.style.backgroundImage = "url('pictures/egor-litvinov-IdsKb3VYRcY-unsplash-horizontal.jpg')"; // Set background image
        document.documentElement.style.backgroundRepeat = 'no-repeat'; // Ensure no repeat
        document.documentElement.style.backgroundSize = 'cover'; // Cover the entire area
    }
}

window.onload = checkAccess;

// Enter key support
document.getElementById('userInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addToArray();
    }
});

window.addReply = function (messageId) {
    const input = document.getElementById(`replyInput-${messageId}`);
    const value = input.value.trim();

    if (value !== '') {
        const timestamp = new Date().toISOString();

        const replyRef = push(ref(database, `userArray/${messageId}/replies`));

        set(replyRef, {
            text: value,
            timestamp: timestamp
        }).then(() => {
            input.value = '';
        }).catch((error) => {
            console.error("Reply failed", error);
        });
    }
}

// theme-mode js

const themeCheckbox = document.getElementById('input');

themeCheckbox.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', input.checked);
});