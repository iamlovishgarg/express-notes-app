const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    note: { type: String, required: true },
    userEmail: { type: String, required: true },
    priority: { type: String },
    color: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Note", NoteSchema);
// export default mongoose.models.Note || mongoose.model("Note", NoteSchema);