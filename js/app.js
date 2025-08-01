//MVC practicing, and use local storage first try

let editNoteIndex = null;

Model = {

    //Save note to local storage

    saveNote(title, content) {
        const newNote = {
            title: title.trim(),
            content: content.trim()
        }

        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
    },

    //Get all notes

    getNotes() {
        return JSON.parse(localStorage.getItem('notes') || '[]');
    },

    //Delete all notes

    deleteAllNotes() {
        localStorage.removeItem('notes');
    }
}

View = {

    //Items show or hidden

    showItem(item) {
        item.classList.toggle('hidden');
    },

    changeMainScreenToNotesScreen() {
        const DOM = View.getDomItems();
        View.showItem(DOM.MainScreen);
        View.showItem(DOM.SettingsBtn);
        View.showItem(DOM.DeleteBtn);
        View.showItem(DOM.NewNotesScreen);

        View.showItem(DOM.BackBtn);
        View.showItem(DOM.CloseNoteBtn);
        View.showItem(DOM.SaveNoteBtn);
    },

    changeMainScreenToSettingsScreen() {
        const DOM = View.getDomItems();
        View.showItem(DOM.MainScreen);
        View.showItem(DOM.SettingsBtn);
        View.showItem(DOM.DeleteBtn);
        View.showItem(DOM.SettingsScreen);
        View.showItem(DOM.BackBtn);
        View.showItem(DOM.SaveBtn);
    },

    //Reset inputs

    resetInput() {
        const DOM = View.getDomItems();
        DOM.NoteTitle.value = '';
        DOM.Note.value = '';
    },

    getDomItems() {
        return {
            NewNoteBtn: document.getElementById('NewNoteBtn'),
            SettingsBtn: document.getElementById('SettingsBtn'),
            DeleteBtn: document.getElementById('DeleteBtn'),
            BackBtn: document.getElementById('BackBtn'),
            CloseNoteBtn: document.getElementById('CloseNoteBtn'),
            SaveNoteBtn: document.getElementById('SaveNoteBtn'),
            SaveBtn: document.getElementById('SaveBtn'),
            MainScreen: document.getElementById('MainScreen'),
            NewNotesScreen: document.getElementById('NewNotesScreen'),
            SettingsScreen: document.getElementById('SettingsScreen'),
            Title: document.getElementById('Title'),
            NoteTitle: document.getElementById('NoteTitle'),
            Note: document.getElementById('Note'),
            notes: document.querySelector('.notes'),
            note: document.querySelectorAll('.note'),
            DeleteAllNotes: document.getElementById('DeleteAllNotes'),
            DarkMode: document.getElementById('DarkMode')
        }
    },

    //Notes showing

    renderNotes(notes) {
        const DOM = View.getDomItems();
        DOM.notes.innerHTML = '';

        notes.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.classList.add('note');
            noteDiv.dataset.index = index;

            const titleEl = document.createElement('h2');
            titleEl.textContent = note.title;

            const contentEl = document.createElement('p');
            contentEl.textContent = note.content;

            noteDiv.appendChild(titleEl);
            noteDiv.appendChild(contentEl);
            DOM.notes.appendChild(noteDiv);
        });

        View.bindNoteEvents();
    },

    //Selected note

    bindNoteEvents() {
        document.querySelectorAll('.note').forEach(noteEl => {
            let pressTimer;

            noteEl.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    noteEl.classList.toggle('selected');
                }, 600);
            });

            noteEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
            noteEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));

            noteEl.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    noteEl.classList.toggle('selected');
                }, 600);
            });

            noteEl.addEventListener('touchend', () => clearTimeout(pressTimer));
            noteEl.addEventListener('touchmove', () => clearTimeout(pressTimer));

            //Editing selected note
            noteEl.addEventListener('click', () => {
                const index = Number(noteEl.dataset.index);
                const notes = Model.getNotes();
                const selectedNote = notes[index];

                if (selectedNote) {
                    const DOM = View.getDomItems();
                    DOM.NoteTitle.value = selectedNote.title;
                    DOM.Note.value = selectedNote.content;
                    DOM.Title.textContent = 'Edit Note';

                    editNoteIndex = index;

                    View.changeMainScreenToNotesScreen();
                }
            });
        });
    },

    //Theme choose

    applyTheme(isDark) {
        if (isDark) {
            document.body.classList.remove('lightMode');
        } else {
            document.body.classList.add('lightMode');
        }
    }
}

Controller = {
    init() {
        let notes = Model.getNotes();
        View.renderNotes(notes);

        const DOM = View.getDomItems();

        DOM.NewNoteBtn.addEventListener('click', () => {
            View.changeMainScreenToNotesScreen();
            DOM.Title.textContent = 'New Note';
            editNoteIndex = null;
            View.resetInput();
        });

        DOM.BackBtn.addEventListener('click', () => {
            editNoteIndex = null;
            if (DOM.Title.textContent === 'New Note' || DOM.Title.textContent === 'Edit Note') {
                View.changeMainScreenToNotesScreen();
            } else {
                View.changeMainScreenToSettingsScreen();
            }
            DOM.Title.textContent = 'CoolNotes';
        });

        DOM.SaveNoteBtn.addEventListener('click', () => {
            let title = DOM.NoteTitle.value;
            let content = DOM.Note.value;

            if (editNoteIndex !== null) {
                let notes = Model.getNotes();
                notes[editNoteIndex] = {
                    title: title.trim(),
                    content: content.trim()
                };
                localStorage.setItem('notes', JSON.stringify(notes));
                editNoteIndex = null;
            } else {
                Model.saveNote(title, content);
            }

            View.renderNotes(Model.getNotes());
            View.changeMainScreenToNotesScreen();
            DOM.Title.textContent = 'CoolNotes';
            View.resetInput();
        });

        DOM.CloseNoteBtn.addEventListener('click', () => {
            editNoteIndex = null;
            View.changeMainScreenToNotesScreen();
            DOM.Title.textContent = 'CoolNotes';
        });

        DOM.SettingsBtn.addEventListener('click', () => {
            View.changeMainScreenToSettingsScreen();
            DOM.Title.textContent = 'Settings';
        });

        DOM.SaveBtn.addEventListener('click', () => {
            if (DOM.DeleteAllNotes.checked) {
                Model.deleteAllNotes();
                alert('Jegyzetek törölve');
                View.renderNotes(Model.getNotes());
                DOM.DeleteAllNotes.checked = false;
            }
            //Dark mode saved
            const isDarkMode = DOM.DarkMode.checked;
            localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
            View.applyTheme(isDarkMode);
        });

        DOM.DeleteBtn.addEventListener('click', () => {
            const selectedNotes = document.querySelectorAll('.note.selected');
            if (selectedNotes.length === 0) {
                alert('Nincs kijelölt jegyzet.');
                return;
            }

            let notes = Model.getNotes();
            const indexesToDelete = Array.from(selectedNotes).map(noteEl => Number(noteEl.dataset.index));
            notes = notes.filter((_, idx) => !indexesToDelete.includes(idx));
            localStorage.setItem('notes', JSON.stringify(notes));
            View.renderNotes(notes);
        });
        //Dark mode load
        const savedTheme = JSON.parse(localStorage.getItem('darkMode'));
        if (savedTheme !== null) {
            DOM.DarkMode.checked = savedTheme;
            View.applyTheme(savedTheme);
        }
    }
}

Controller.init();

if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW reg failed:', err));
    });
}