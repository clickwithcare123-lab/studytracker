# studytracker
# Academic Tracker

A fully static, responsive Academic Tracker web app for managing your courses and tracking academic progress. Built with only HTML, CSS, and JavaScript—no backend or Node.js required. Perfect for static hosting on Vercel.

## Features
- **User-friendly UI:** Clean, modern, and responsive design (desktop & mobile)
- **Course Management:** Add, edit, delete, and mark courses as completed or ongoing
- **Semester Tracking:** Group courses by semester, visualize progress with progress bars
- **Dashboard:** See total courses, credits, current semester, and recent activity
- **Data Persistence:** All data stored in your browser (localStorage)
- **Export/Import:** Backup or restore your data as JSON
- **Search & Filter:** Quickly find and filter courses
- **Notifications:** Toast alerts for actions and errors
- **About Page:** Explains the app and how to use it
- **Accessibility:** Semantic HTML, keyboard navigation, ARIA labels
- **Dark Mode:** Toggle between light and dark themes

## Usage
1. **Add Courses:** Click "+ Add Course" and fill in the details.
2. **Edit/Delete:** Use the action buttons next to each course.
3. **Track Progress:** View semester progress bars and dashboard stats.
4. **Export/Import:** Use the buttons in the Courses section to backup or restore your data.
5. **Search/Filter:** Use the search bar and dropdowns to find courses.
6. **Dark Mode:** Click the moon/sun icon in the navbar.

## Deployment (Vercel)
1. [Fork or download](https://github.com/) this repository.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your forked/downloaded repo.
4. Vercel will auto-detect and deploy as a static site (no build step needed).
5. Visit your deployed URL and start using Academic Tracker!

## Project Structure
- `index.html` – Main HTML file
- `styles.css` – All styles (responsive, dark mode, accessibility)
- `script.js` – All logic (course management, dashboard, storage, etc.)
- `README.md` – This file

## Notes
- **No backend:** All data is private and stays in your browser.
- **No frameworks:** Pure HTML, CSS, and JS for speed and simplicity.
- **Accessibility:** Use keyboard navigation and screen readers with ease.
- **Optional:** You can extend with Firebase Auth/Firestore for cloud sync (not included by default).

---

Enjoy tracking your academic journey! 🎓

