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
  id: string
  title: string
  summary: string
  sections: Section[]
  questions: Question[]
}

export const lessons: Lesson[] = [
  {
    id: "photosynthesis",
    title: "Photosynthesis",
    summary: "How plants make their own food.",
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
  },
  {
    id: "water-cycle",
    title: "The water cycle",
    summary: "Where rain comes from.",
    sections: [
      {
        id: 1,
        title: "Water goes up",
        text: "The sun heats water in rivers, lakes and the sea. The water turns into a gas called vapour. The vapour rises into the air.",
      },
      {
        id: 2,
        title: "Clouds form",
        text: "High up, the air is cold. The vapour cools down and turns back into tiny drops of water. Many tiny drops make a cloud.",
      },
      {
        id: 3,
        title: "Rain falls",
        text: "When the drops get heavy, they fall as rain. The rain fills rivers and soaks into the ground. Then the cycle starts again.",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What heats the water so it rises?",
        options: ["The moon", "The sun", "The wind"],
        answer: 1,
        explanation: "The sun heats the water and turns it into vapour.",
      },
      {
        id: 2,
        question: "What do many tiny drops of water make?",
        options: ["A cloud", "A river", "A rock"],
        answer: 0,
        explanation: "Many tiny drops together make a cloud.",
      },
      {
        id: 3,
        question: "Why does rain fall?",
        options: ["The drops get heavy", "The sun goes away", "The wind stops"],
        answer: 0,
        explanation: "When the drops get heavy, they fall as rain.",
      },
    ],
  },
  {
    id: "healthy-teeth",
    title: "Healthy teeth",
    summary: "How to look after your teeth.",
    sections: [
      {
        id: 1,
        title: "Why teeth matter",
        text: "We use our teeth to bite and chew food. Strong teeth help us eat well. They also help us speak clearly.",
      },
      {
        id: 2,
        title: "What harms teeth",
        text: "Sugary food and drinks can make holes in teeth. These holes are called cavities. They can hurt a lot.",
      },
      {
        id: 3,
        title: "How to care for them",
        text: "Brush your teeth in the morning and before bed. Eat fewer sweets. Visit a dentist to check your teeth.",
      },
    ],
    questions: [
      {
        id: 1,
        question: "What can make holes in teeth?",
        options: ["Water", "Sugary food and drinks", "Fresh air"],
        answer: 1,
        explanation: "Sugary food and drinks can make holes called cavities.",
      },
      {
        id: 2,
        question: "When should you brush your teeth?",
        options: ["Only on Sundays", "Morning and before bed", "Never"],
        answer: 1,
        explanation: "Brush in the morning and before bed.",
      },
      {
        id: 3,
        question: "Who can check your teeth?",
        options: ["A dentist", "A baker", "A driver"],
        answer: 0,
        explanation: "A dentist checks your teeth to keep them healthy.",
      },
    ],
  },
]