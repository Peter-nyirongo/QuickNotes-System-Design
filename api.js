// A. API Configuration
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// B. Reusable Request Function
/**
 * Sends an HTTP request and handles parsing and errors consistently.
 * @param {string} url - The endpoint URL.
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<{data: any, status: number}>} - Parsed data and HTTP status.
 */
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            // Throw an error for 4xx or 5xx status codes
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Handle responses that do not contain a JSON body (e.g., DELETE responses)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return { data: await response.json(), status: response.status };
        }
        
        // Return null data for non-JSON successful responses (like 204 No Content)
        return { data: null, status: response.status };
    } catch (error) {
        // Re-throw to be handled by the calling function
        throw error;
    }
}

// UI Helper Functions
const statusEl = document.getElementById("status");
const notesListEl = document.getElementById("notes-list");
const loadBtn = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const submitBtn = document.getElementById("submit-btn");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");

function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "status-message visible"; // Reset classes
    if (type === "loading") statusEl.classList.add("status-loading");
    else if (type === "success") statusEl.classList.add("status-success");
    else if (type === "error") statusEl.classList.add("status-error");
    else if (type === "empty") statusEl.classList.add("status-empty");
}

function clearStatus() {
    statusEl.textContent = "";
    statusEl.className = "status-message";
}

// C. GET: Load Notes
async function loadNotes() {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");
    notesListEl.innerHTML = ""; // Clear current list

    try {
        // Request up to 10 notes
        const { data, status } = await request(`${API_URL}?_limit=10`);
        
        if (!data || data.length === 0) {
            setStatus("No notes found.", "empty");
            notesListEl.innerHTML = "<li class='status-empty' style='padding: 15px;'>No notes available to display.</li>";
            return;
        }

        renderNotes(data);
        setStatus(`Loaded ${data.length} notes from the server.`, "success");
    } catch (error) {
        console.error("Failed to load notes:", error);
        setStatus("Failed to load notes. Please check your internet connection.", "error");
    } finally {
        // I & H: Restore button state in finally block
        loadBtn.disabled = false;
    }
}

// D. Render Notes Safely
function renderNotes(notes) {
    notesListEl.innerHTML = ""; // Ensure list is empty before rendering

    notes.forEach(note => {
        const li = document.createElement("li");
        li.className = "note-item";
        li.dataset.id = note.id; // Store ID for deletion

        const titleEl = document.createElement("h3");
        titleEl.className = "note-title";
        // SAFE: Use textContent to prevent Cross-Site Scripting (XSS)
        titleEl.textContent = note.title || "Untitled Note";

        const bodyEl = document.createElement("p");
        bodyEl.className = "note-body";
        // SAFE: Use textContent to prevent XSS
        bodyEl.textContent = note.body || "No content provided.";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteNote(note.id, li, deleteBtn));

        li.appendChild(titleEl);
        li.appendChild(bodyEl);
        li.appendChild(deleteBtn);
        notesListEl.appendChild(li);
    });
}

// E. POST: Create Notes
async function createNote(event) {
    event.preventDefault(); // Prevent default form submission

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation
    if (!title) {
        setStatus("Validation error: Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        setStatus("Validation error: Title must not exceed 100 characters.", "error");
        return;
    }

    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");

    const payload = {
        title: title,
        body: body,
        userId: 1 // Mock user ID for the practice API
    };

    try {
        const { data, status } = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // 10 & 11: Add to top of list and show status with returned ID
        const newNote = { id: data.id, title: data.title, body: data.body };
        
        // Create a temporary array with the new note at the front, then render
        // Note: We only prepend if we already have notes loaded, otherwise just render it
        const currentNotes = Array.from(notesListEl.children).map(li => ({
            id: parseInt(li.dataset.id),
            title: li.querySelector(".note-title").textContent,
            body: li.querySelector(".note-body").textContent
        }));
        
        currentNotes.unshift(newNote);
        renderNotes(currentNotes);

        setStatus(`Note created (status ${status}, id ${data.id}).`, "success");
        
        // 12: Clear form
        noteForm.reset();
    } catch (error) {
        console.error("Failed to create note:", error);
        setStatus("Failed to create note. Please try again.", "error");
    } finally {
        // 13: Restore submit button
        submitBtn.disabled = false;
    }
}

// F. DELETE: Remove Notes
async function deleteNote(id, listItem, deleteBtn) {
    deleteBtn.disabled = true;
    setStatus(`Deleting note ${id}...`, "loading");

    try {
        /* 
         * IMPORTANT JSONPlaceholder Limitation:
         * JSONPlaceholder is a practice API. It simulates POST and DELETE operations 
         * and returns success responses, but it DOES NOT permanently store or delete 
         * data on the server. The browser's displayed list is updated to reflect 
         * the successful operation locally, but refreshing the page will reload 
         * the original mock dataset.
         */
        const { status } = await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        // 5: Remove from DOM only after successful response
        listItem.remove();
        setStatus(`Note ${id} deleted successfully (status ${status}).`, "success");

        // Handle empty list after deletion
        if (notesListEl.children.length === 0) {
            setStatus("No notes available. Load or create some notes!", "empty");
            notesListEl.innerHTML = "<li class='status-empty' style='padding: 15px;'>No notes available to display.</li>";
        }
    } catch (error) {
        console.error(`Failed to delete note ${id}:`, error);
        setStatus(`Failed to delete note ${id}. Please try again.`, "error");
    } finally {
        // 8: Restore button state (though it's removed from DOM, good practice)
        deleteBtn.disabled = false;
    }
}

// Event Listeners
loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Initialize with an empty state message
setStatus("Welcome! Click 'Load notes' to fetch data from the server.", "empty");