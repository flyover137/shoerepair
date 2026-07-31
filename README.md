# Main Street Shoe Repair - Status Tracker

Welcome to the Customer Repair Tracker dashboard code repository!

This website allows your customers to search for their repair status using their ticket number.

## 📋 How to Manage Repair Tickets

To add new tickets or update the status of existing repairs, you only need to edit **one file**:

### 👉 [src/data/tickets.json](file:///Users/jan/Sites/shoe-repair/src/data/tickets.json)

Inside this file, you'll see a list of tickets structured like this:

```json
  {
    "ticketNumber": "1005",
    "ticketDate": "2026-07-31",
    "shoeDescription": "Sneaker Cleaning & Stitching",
    "status": "ready"
  }
```

### ✏️ Editing Guidelines:

1. **Ticket Number (`ticketNumber`)**: The custom ticket number (e.g., `"1009"`). It must be enclosed in double quotes.
2. **Date Received (`ticketDate`)**: The date you received the shoes, formatted as `"YYYY-MM-DD"`.
3. **Description (`shoeDescription`)**: What type of shoe and repair is being done (e.g., `"Oxford Heel Replacement"`).
4. **Status (`status`)**: Choose exactly one of the following three options (must be lowercase):
   - `"waiting"` (turns amber on the website)
   - `"working"` (turns blue on the website)
   - `"ready"` (turns green on the website)

*Note: Make sure each ticket description ends with a comma `,` except for the very last ticket in the list.*

---

## 💻 Technical Commands

If you are running the site locally:

* Start the development server: `npm run dev`
* Compile the site for production: `npm run build`
