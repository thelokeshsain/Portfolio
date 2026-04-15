// Portfolio Model — Enforces strict length limits on all fields to prevent database bloat.
// Supports dynamic skills categorisation via Mixed type.
const mongoose = require("mongoose");

const s = new mongoose.Schema(
  {
    hero: {
      name: { type: String, maxlength: 100 },
      title: { type: String, maxlength: 100 },
      role: { type: String, maxlength: 100 },
      description: { type: String, maxlength: 1000 },
      email: { type: String, maxlength: 254 },
      phone: { type: String, maxlength: 20 },
      location: { type: String, maxlength: 100 },
      github: { type: String, maxlength: 300 },
      linkedin: { type: String, maxlength: 300 },
      resumeUrl: { type: String, maxlength: 300 },
      available: { type: Boolean, default: true },
      image: { type: String, maxlength: 2_500_000 }, // ~1.9MB base64 for a 1.4MB image
    },
    stats: [
      {
        num: { type: String, maxlength: 20 },
        label: { type: String, maxlength: 60 },
        bg: { type: String, maxlength: 50 },
        color: { type: String, maxlength: 20 },
      },
    ],
    about: [{ type: String, maxlength: 1000 }],
    education: [
      {
        abbr: { type: String, maxlength: 20 },
        name: { type: String, maxlength: 200 },
        period: { type: String, maxlength: 50 },
        grade: { type: String, maxlength: 50 },
        bg: { type: String, maxlength: 50 },
        color: { type: String, maxlength: 20 },
      },
    ],
    achievements: [
      {
        icon: { type: String, maxlength: 10 },
        title: { type: String, maxlength: 100 },
        sub: { type: String, maxlength: 100 },
      },
    ],
    experience: [
      {
        id: Number,
        role: { type: String, maxlength: 100 },
        company: { type: String, maxlength: 150 },
        location: { type: String, maxlength: 100 },
        period: { type: String, maxlength: 50 },
        current: Boolean,
        points: [{ type: String, maxlength: 500 }],
      },
    ],
    projects: [
      {
        id: Number,
        title: { type: String, maxlength: 100 },
        file: { type: String, maxlength: 200 },
        category: { type: String, maxlength: 50 },
        accentBg: { type: String, maxlength: 50 },
        accentColor: { type: String, maxlength: 20 },
        tagClass: { type: String, maxlength: 30 },
        period: { type: String, maxlength: 50 },
        desc: { type: String, maxlength: 1000 },
        tags: [{ type: String, maxlength: 50 }],
        link: { type: String, maxlength: 300 },
        github: { type: String, maxlength: 300 },
        visible: { type: Boolean, default: true },
        image: { type: String, default: null, maxlength: 2_000_000 }, // base64 project logo (max ~1.5MB file)
      },
    ],
    skills: { type: mongoose.Schema.Types.Mixed, default: {} },
    coreStack: [{ type: String, maxlength: 60 }],
    sections: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Portfolio", s);
