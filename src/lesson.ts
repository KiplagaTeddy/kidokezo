export type Section = {
  id: number
  title: string
  text: string
}

export type Question = {
  id: number
  question: string
  options: string[]
  answer: number
  explanation: string
}

export type Lesson = {
  title: string
  sections: Section[]
  questions: Question[]
}

export const photosynthesis: Lesson = {
  title: "Photosynthesis",
  sections: [
    {
      id: 1,
      title: "What is photosynthesis?",
      text: "Photosynthesis is how plants make their own food. They use sunlight, water and air.",
    },
    {
      id: 2,
      title: "What plants need",
      text: "Plants take in water through their roots. They take in air through tiny holes in their leaves. Sunlight gives them the energy to work.",
    },
    {
      id: 3,
      title: "What plants make",
      text: "Plants make sugar for food. They also give out oxygen. We breathe this oxygen.",
    },
  ],
    questions: [
    {
      id: 1,
      question: "What do plants use to make food?",
      options: ["Sunlight, water and air", "Soil only", "Sugar from shops"],
      answer: 0,
      explanation: "Plants use sunlight, water and air to make their own food.",
    },
    {
      id: 2,
      question: "How do plants take in water?",
      options: ["Through their leaves", "Through their roots", "Through their flowers"],
      answer: 1,
      explanation: "Water goes in through the roots.",
    },
    {
      id: 3,
      question: "What gas do plants give out?",
      options: ["Smoke", "Oxygen", "Steam"],
      answer: 1,
      explanation: "Plants give out oxygen, and we breathe it.",
    },
  ],
  
}