// Aus dem Plan-PDF (5-1) ausgelesen: Positionen je Schritt in Metern, Texte auf Deutsch (Z=Zuspieler, D=Diagonal, A=Außen, M=Mitte).
// Erzeugt per Skript aus den Text- und Positionsdaten des PDFs. Schlüssel: "<Rotation>-<serve|receive>".
(function () {
  const PDF_PLANS = {
 "1-receive": {
  "passers": [
   "O",
   "H2",
   "M1"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Optionen aus diesem Stack: A1 oder M2 fallen zurück und decken kurze Aufschläge, oder A1 rutscht ganz nach hinten und D, A2 oder M1 treten aus der Annahme heraus. Überlege selbst, wie in jedem Fall die relative Position erhalten bleibt.",
    "pos": {
     "M2": {
      "x": 2.4,
      "y": 0.75
     },
     "H1": {
      "x": 8.11,
      "y": 0.84
     },
     "S": {
      "x": 8.21,
      "y": 2.09
     },
     "O": {
      "x": 1.46,
      "y": 6.65
     },
     "M1": {
      "x": 7.19,
      "y": 7.19
     },
     "H2": {
      "x": 4.44,
      "y": 7.81
     }
    },
    "delays": {},
    "passers": [
     "O",
     "H2",
     "M1"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z löst sich sofort. A1 und M2 lösen sich zum Angriff, achten aber auf kurze Aufschläge. D, A2 und M1 nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "M2": {
      "x": 3.95,
      "y": 2.74
     },
     "O": {
      "x": -0.68,
      "y": 2.96
     },
     "H1": {
      "x": 9.34,
      "y": 2.77
     },
     "H2": {
      "x": 2.31,
      "y": 6.72
     },
     "M1": {
      "x": 6.72,
      "y": 7.14
     }
    },
    "delays": {
     "S": 0.0,
     "O": 1.3,
     "H1": 0.4,
     "H2": 1.3,
     "M1": 1.3,
     "M2": 0.4
    },
    "passers": [
     "O",
     "H2",
     "M1"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "M2": {
      "x": 3.95,
      "y": 2.74
     },
     "O": {
      "x": -0.68,
      "y": 2.96
     },
     "H1": {
      "x": 9.34,
      "y": 2.77
     },
     "H2": {
      "x": 2.31,
      "y": 6.72
     },
     "M1": {
      "x": 6.72,
      "y": 7.14
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "O": {
      "x": -0.6,
      "y": 2.81
     },
     "M2": {
      "x": 4.02,
      "y": 2.66
     },
     "H1": {
      "x": 9.69,
      "y": 2.56
     },
     "H2": {
      "x": 2.66,
      "y": 6.65
     },
     "M1": {
      "x": 7.22,
      "y": 7.17
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "O": {
      "x": 0.71,
      "y": 0.76
     },
     "S": {
      "x": 7.23,
      "y": 0.76
     },
     "M2": {
      "x": 2.95,
      "y": 1.06
     },
     "H2": {
      "x": 1.22,
      "y": 2.64
     },
     "H1": {
      "x": 7.61,
      "y": 4.25
     },
     "M1": {
      "x": 3.91,
      "y": 6.96
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.74,
      "y": 1.06
     },
     "M2": {
      "x": 4.74,
      "y": 0.86
     },
     "O": {
      "x": 7.6,
      "y": 0.83
     },
     "H2": {
      "x": 1.82,
      "y": 3.82
     },
     "S": {
      "x": 7.77,
      "y": 3.82
     },
     "M1": {
      "x": 4.88,
      "y": 7.14
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "1-serve": {
  "server": "S",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M2. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "O": {
      "x": 3.41,
      "y": 1.76
     },
     "M2": {
      "x": 4.56,
      "y": 0.88
     },
     "H1": {
      "x": 5.74,
      "y": 2.46
     },
     "H2": {
      "x": 2.23,
      "y": 5.53
     },
     "M1": {
      "x": 6.23,
      "y": 5.99
     },
     "S": {
      "x": 7.93,
      "y": 10.17
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "Z schlägt auf und läuft dann auf ihre Abwehrposition. A2 und M1 warten, ob ein Überpass kommt, und gehen dann in die Abwehr. D und A1 wechseln sofort, wenn Z aufschlägt.",
    "pos": {
     "H1": {
      "x": 1.61,
      "y": 0.85
     },
     "M2": {
      "x": 4.57,
      "y": 0.87
     },
     "O": {
      "x": 7.33,
      "y": 0.87
     },
     "H2": {
      "x": 1.75,
      "y": 4.26
     },
     "S": {
      "x": 7.39,
      "y": 4.28
     },
     "M1": {
      "x": 4.73,
      "y": 7.41
     }
    },
    "delays": {
     "S": 0.0,
     "O": 0.3,
     "H1": 0.3,
     "H2": 1.2,
     "M1": 1.2,
     "M2": 0.3
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.61,
      "y": 0.85
     },
     "M2": {
      "x": 4.57,
      "y": 0.87
     },
     "O": {
      "x": 7.33,
      "y": 0.87
     },
     "H2": {
      "x": 1.75,
      "y": 4.26
     },
     "S": {
      "x": 7.39,
      "y": 4.28
     },
     "M1": {
      "x": 4.73,
      "y": 7.41
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "2-receive": {
  "passers": [
   "H2",
   "M1",
   "H1"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Optionen aus diesem Stack: M2 fällt zurück und hilft bei kurzen Aufschlägen, oder D rutscht ganz nach hinten und passt dort, wo M1 steht. Überlege selbst, wie die relative Position erhalten bleibt.",
    "pos": {
     "O": {
      "x": 7.07,
      "y": 0.81
     },
     "S": {
      "x": 6.13,
      "y": 1.69
     },
     "M2": {
      "x": 8.03,
      "y": 2.56
     },
     "H2": {
      "x": 1.67,
      "y": 6.39
     },
     "H1": {
      "x": 7.78,
      "y": 6.23
     },
     "M1": {
      "x": 4.67,
      "y": 7.25
     }
    },
    "delays": {},
    "passers": [
     "H2",
     "M1",
     "H1"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z löst sich sofort. D und M2 lösen sich zum Angriff, achten aber auf kurze Aufschläge. A2, M1 und A1 nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M2": {
      "x": 3.98,
      "y": 2.71
     },
     "O": {
      "x": 9.38,
      "y": 2.67
     },
     "M1": {
      "x": 2.51,
      "y": 6.41
     },
     "H1": {
      "x": 6.69,
      "y": 6.65
     }
    },
    "delays": {
     "S": 0.0,
     "O": 0.4,
     "H1": 1.3,
     "H2": 1.3,
     "M1": 1.3,
     "M2": 0.4
    },
    "passers": [
     "H2",
     "M1",
     "H1"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M2": {
      "x": 3.98,
      "y": 2.71
     },
     "O": {
      "x": 9.38,
      "y": 2.67
     },
     "M1": {
      "x": 2.51,
      "y": 6.41
     },
     "H1": {
      "x": 6.69,
      "y": 6.65
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "M2": {
      "x": 4.05,
      "y": 2.61
     },
     "H2": {
      "x": -0.39,
      "y": 2.76
     },
     "O": {
      "x": 9.28,
      "y": 2.76
     },
     "M1": {
      "x": 2.58,
      "y": 6.65
     },
     "H1": {
      "x": 7.07,
      "y": 6.98
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "H2": {
      "x": 0.89,
      "y": 0.8
     },
     "M1": {
      "x": 1.43,
      "y": 2.69
     },
     "S": {
      "x": 7.23,
      "y": 0.77
     },
     "M2": {
      "x": 2.95,
      "y": 1.26
     },
     "O": {
      "x": 7.3,
      "y": 4.32
     },
     "H1": {
      "x": 3.69,
      "y": 7.28
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "M2": {
      "x": 4.54,
      "y": 0.84
     },
     "H2": {
      "x": 1.37,
      "y": 0.84
     },
     "O": {
      "x": 7.6,
      "y": 0.84
     },
     "H1": {
      "x": 1.32,
      "y": 3.85
     },
     "S": {
      "x": 7.77,
      "y": 3.86
     },
     "M1": {
      "x": 4.88,
      "y": 7.14
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "2-serve": {
  "server": "H1",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M2. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "H2": {
      "x": 1.44,
      "y": 0.87
     },
     "M2": {
      "x": 4.73,
      "y": 0.88
     },
     "O": {
      "x": 3.6,
      "y": 1.76
     },
     "S": {
      "x": 6.53,
      "y": 5.39
     },
     "M1": {
      "x": 3.17,
      "y": 6.05
     },
     "H1": {
      "x": 7.89,
      "y": 9.88
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "A1 schlägt auf und läuft auf ihre Abwehrposition. Sie kann auch von links aufschlagen, um den Weg zu verkürzen. M1 und Z prüfen auf Überpass und gehen dann. D wechselt sofort, wenn A1 aufschlägt.",
    "pos": {
     "M2": {
      "x": 4.51,
      "y": 0.87
     },
     "H2": {
      "x": 1.38,
      "y": 0.91
     },
     "O": {
      "x": 7.64,
      "y": 0.91
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "S": {
      "x": 7.39,
      "y": 4.28
     },
     "M1": {
      "x": 4.73,
      "y": 7.41
     }
    },
    "delays": {
     "S": 1.2,
     "O": 0.3,
     "H1": 0.0,
     "H2": 0.3,
     "M1": 1.2,
     "M2": 0.3
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "M2": {
      "x": 4.51,
      "y": 0.87
     },
     "H2": {
      "x": 1.38,
      "y": 0.91
     },
     "O": {
      "x": 7.64,
      "y": 0.91
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "S": {
      "x": 7.39,
      "y": 4.28
     },
     "M1": {
      "x": 4.73,
      "y": 7.41
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "3-receive": {
  "passers": [
   "H2",
   "H1",
   "M2"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Hier hat die vordere Angreiferin A2 Vorrang und steht nah an ihrer Angriffsposition. Z muss quer übers Netz zu ihrem Zuspielpunkt laufen, kann aber auch bis ganz zu A1 rutschen. Es gibt VIELE Varianten dieses Stacks, um die besten Annehmer annehmen zu lassen, besonders mit D.",
    "pos": {
     "M1": {
      "x": 0.87,
      "y": 0.81
     },
     "S": {
      "x": 0.91,
      "y": 1.93
     },
     "O": {
      "x": 8.12,
      "y": 2.23
     },
     "H2": {
      "x": 1.8,
      "y": 6.39
     },
     "M2": {
      "x": 7.42,
      "y": 6.42
     },
     "H1": {
      "x": 4.41,
      "y": 7.34
     }
    },
    "delays": {},
    "passers": [
     "H2",
     "H1",
     "M2"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z löst sich sofort. M1 lässt Z durch und geht dann zum Angriff. D achtet auf kurze Aufschläge und geht dann zum Angriff. A2, A1 und M2 nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M1": {
      "x": 4.22,
      "y": 2.67
     },
     "O": {
      "x": 9.38,
      "y": 2.67
     },
     "H1": {
      "x": 2.63,
      "y": 6.23
     },
     "M2": {
      "x": 6.25,
      "y": 6.33
     }
    },
    "delays": {
     "S": 0.0,
     "O": 0.4,
     "H1": 1.3,
     "H2": 1.3,
     "M1": 0.4,
     "M2": 1.3
    },
    "passers": [
     "H2",
     "H1",
     "M2"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M1": {
      "x": 4.22,
      "y": 2.67
     },
     "O": {
      "x": 9.38,
      "y": 2.67
     },
     "H1": {
      "x": 2.63,
      "y": 6.23
     },
     "M2": {
      "x": 6.25,
      "y": 6.33
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "M1": {
      "x": 3.95,
      "y": 2.7
     },
     "H2": {
      "x": -0.39,
      "y": 2.76
     },
     "O": {
      "x": 9.28,
      "y": 2.76
     },
     "H1": {
      "x": 2.69,
      "y": 6.69
     },
     "M2": {
      "x": 7.0,
      "y": 6.95
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "H2": {
      "x": 0.89,
      "y": 0.8
     },
     "H1": {
      "x": 1.39,
      "y": 2.59
     },
     "S": {
      "x": 7.23,
      "y": 0.77
     },
     "M1": {
      "x": 2.99,
      "y": 1.21
     },
     "O": {
      "x": 7.3,
      "y": 4.32
     },
     "M2": {
      "x": 3.14,
      "y": 7.24
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "M1": {
      "x": 4.66,
      "y": 0.79
     },
     "H2": {
      "x": 1.37,
      "y": 0.84
     },
     "O": {
      "x": 7.6,
      "y": 0.84
     },
     "H1": {
      "x": 1.32,
      "y": 3.85
     },
     "S": {
      "x": 7.77,
      "y": 3.86
     },
     "M2": {
      "x": 4.74,
      "y": 7.34
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "3-serve": {
  "server": "M2",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M1. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "M1": {
      "x": 4.64,
      "y": 0.78
     },
     "O": {
      "x": 7.71,
      "y": 0.85
     },
     "H2": {
      "x": 5.74,
      "y": 1.73
     },
     "S": {
      "x": 4.06,
      "y": 4.28
     },
     "H1": {
      "x": 5.45,
      "y": 5.77
     },
     "M2": {
      "x": 7.87,
      "y": 9.9
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "M2 schlägt auf und läuft auf ihre Abwehrposition. A1, A2 und Z gehen sofort, achten dabei aber auf den Überpass.",
    "pos": {
     "H2": {
      "x": 1.38,
      "y": 0.97
     },
     "O": {
      "x": 7.64,
      "y": 0.97
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "S": {
      "x": 7.53,
      "y": 4.21
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {
     "S": 0.3,
     "O": 0.3,
     "H1": 0.3,
     "H2": 0.3,
     "M1": 0.3,
     "M2": 0.0
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H2": {
      "x": 1.38,
      "y": 0.97
     },
     "O": {
      "x": 7.64,
      "y": 0.97
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "S": {
      "x": 7.53,
      "y": 4.21
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "4-receive": {
  "passers": [
   "H1",
   "M2",
   "O"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Auch hier steht die vordere Angreiferin nah an ihrer Angriffsposition. A2 kann kurze Aufschläge decken oder ganz nach hinten rutschen und anstelle von A1, M2 oder D annehmen. Überlege selbst, wie die relative Position erhalten bleibt.",
    "pos": {
     "S": {
      "x": 0.79,
      "y": 0.76
     },
     "M1": {
      "x": 1.35,
      "y": 1.61
     },
     "H2": {
      "x": 2.04,
      "y": 2.46
     },
     "H1": {
      "x": 1.76,
      "y": 6.29
     },
     "O": {
      "x": 7.5,
      "y": 6.33
     },
     "M2": {
      "x": 4.54,
      "y": 7.16
     }
    },
    "delays": {},
    "passers": [
     "H1",
     "M2",
     "O"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z löst sich sofort beim Aufschlag. M1 lässt Z durch und geht dann zum Angriff. A2 geht zum Angriff. A1, M2 und D nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M1": {
      "x": 4.22,
      "y": 2.67
     },
     "O": {
      "x": 9.23,
      "y": 4.85
     },
     "H1": {
      "x": 2.63,
      "y": 6.23
     },
     "M2": {
      "x": 6.25,
      "y": 6.33
     }
    },
    "delays": {
     "S": 0.0,
     "O": 1.3,
     "H1": 1.3,
     "H2": 0.4,
     "M1": 0.4,
     "M2": 1.3
    },
    "passers": [
     "H1",
     "M2",
     "O"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "D will jetzt aus dem Hinterfeld angreifen, nicht von vorn. Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H2": {
      "x": -0.47,
      "y": 2.67
     },
     "M1": {
      "x": 4.22,
      "y": 2.67
     },
     "O": {
      "x": 9.23,
      "y": 4.85
     },
     "H1": {
      "x": 2.63,
      "y": 6.23
     },
     "M2": {
      "x": 6.25,
      "y": 6.33
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "H2": {
      "x": -0.39,
      "y": 2.83
     },
     "M1": {
      "x": 3.95,
      "y": 2.7
     },
     "O": {
      "x": 9.28,
      "y": 5.0
     },
     "H1": {
      "x": 2.69,
      "y": 6.69
     },
     "M2": {
      "x": 7.0,
      "y": 6.95
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "M1": {
      "x": 2.99,
      "y": 1.21
     },
     "H2": {
      "x": 0.89,
      "y": 0.8
     },
     "H1": {
      "x": 1.39,
      "y": 2.59
     },
     "S": {
      "x": 7.23,
      "y": 0.77
     },
     "O": {
      "x": 7.22,
      "y": 4.5
     },
     "M2": {
      "x": 3.14,
      "y": 7.24
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H2": {
      "x": 1.37,
      "y": 0.84
     },
     "M1": {
      "x": 4.66,
      "y": 0.79
     },
     "S": {
      "x": 7.63,
      "y": 0.8
     },
     "H1": {
      "x": 1.32,
      "y": 3.85
     },
     "O": {
      "x": 7.76,
      "y": 3.91
     },
     "M2": {
      "x": 4.74,
      "y": 7.34
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "4-serve": {
  "server": "O",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M1. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "M1": {
      "x": 4.71,
      "y": 0.78
     },
     "S": {
      "x": 3.33,
      "y": 1.57
     },
     "H2": {
      "x": 5.99,
      "y": 2.28
     },
     "H1": {
      "x": 2.42,
      "y": 5.6
     },
     "M2": {
      "x": 6.45,
      "y": 6.22
     },
     "O": {
      "x": 8.08,
      "y": 9.87
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "D schlägt auf und läuft auf ihre Abwehrposition. A1 und M2 achten auf Überpass und gehen dann. Z und A2 wechseln sofort, wenn D aufschlägt.",
    "pos": {
     "H2": {
      "x": 1.38,
      "y": 1.0
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "O": {
      "x": 7.64,
      "y": 4.18
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {
     "S": 0.3,
     "O": 0.0,
     "H1": 1.2,
     "H2": 0.3,
     "M1": 0.3,
     "M2": 1.2
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H2": {
      "x": 1.38,
      "y": 1.0
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H1": {
      "x": 1.61,
      "y": 4.18
     },
     "O": {
      "x": 7.64,
      "y": 4.18
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "5-receive": {
  "passers": [
   "M2",
   "O",
   "H2"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Dieser Stack bringt Z nah an ihren Zuspielpunkt. A1 kann kurze Aufschläge decken oder ganz nach hinten rutschen und anstelle von M2, D oder A2 annehmen. Überlege selbst, wie die relative Position erhalten bleibt.",
    "pos": {
     "S": {
      "x": 5.95,
      "y": 0.76
     },
     "H1": {
      "x": 1.47,
      "y": 2.3
     },
     "M1": {
      "x": 7.13,
      "y": 2.34
     },
     "H2": {
      "x": 7.56,
      "y": 6.14
     },
     "M2": {
      "x": 1.47,
      "y": 6.42
     },
     "O": {
      "x": 4.5,
      "y": 7.5
     }
    },
    "delays": {},
    "passers": [
     "M2",
     "O",
     "H2"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z geht zum Zuspielpunkt. M1 und A1 gehen zum Angriff, sobald der Aufschlag berührt ist. M2, D und A2 nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H1": {
      "x": -0.64,
      "y": 2.79
     },
     "M1": {
      "x": 4.22,
      "y": 2.79
     },
     "M2": {
      "x": 2.8,
      "y": 6.11
     },
     "H2": {
      "x": 9.32,
      "y": 4.79
     },
     "O": {
      "x": 6.57,
      "y": 5.91
     }
    },
    "delays": {
     "S": 0.0,
     "O": 1.3,
     "H1": 0.4,
     "H2": 1.3,
     "M1": 0.4,
     "M2": 1.3
    },
    "passers": [
     "M2",
     "O",
     "H2"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "A2 will aus dem Hinterfeld angreifen, nicht von vorn. Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H1": {
      "x": -0.64,
      "y": 2.79
     },
     "M1": {
      "x": 4.22,
      "y": 2.79
     },
     "M2": {
      "x": 2.8,
      "y": 6.11
     },
     "H2": {
      "x": 9.32,
      "y": 4.79
     },
     "O": {
      "x": 6.57,
      "y": 5.91
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "H1": {
      "x": -0.54,
      "y": 2.79
     },
     "M1": {
      "x": 3.95,
      "y": 2.79
     },
     "H2": {
      "x": 9.5,
      "y": 4.91
     },
     "M2": {
      "x": 2.67,
      "y": 6.62
     },
     "O": {
      "x": 6.99,
      "y": 6.98
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "M1": {
      "x": 2.99,
      "y": 1.21
     },
     "H1": {
      "x": 0.98,
      "y": 0.79
     },
     "M2": {
      "x": 0.97,
      "y": 2.69
     },
     "S": {
      "x": 7.23,
      "y": 0.77
     },
     "H2": {
      "x": 7.56,
      "y": 4.44
     },
     "O": {
      "x": 3.32,
      "y": 6.86
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.25,
      "y": 0.84
     },
     "M1": {
      "x": 4.66,
      "y": 0.84
     },
     "S": {
      "x": 7.63,
      "y": 0.86
     },
     "H2": {
      "x": 1.54,
      "y": 3.91
     },
     "O": {
      "x": 7.76,
      "y": 3.91
     },
     "M2": {
      "x": 4.74,
      "y": 7.34
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "5-serve": {
  "server": "H2",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M1. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "H1": {
      "x": 1.26,
      "y": 0.83
     },
     "M1": {
      "x": 4.71,
      "y": 0.83
     },
     "S": {
      "x": 3.33,
      "y": 1.57
     },
     "O": {
      "x": 6.66,
      "y": 5.51
     },
     "M2": {
      "x": 2.95,
      "y": 6.15
     },
     "H2": {
      "x": 7.95,
      "y": 10.02
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "A2 schlägt auf und läuft auf ihre Abwehrposition. M2 und D achten auf Überpass und gehen dann. Z wechselt sofort, wenn A2 aufschlägt.",
    "pos": {
     "H1": {
      "x": 1.31,
      "y": 0.97
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.57,
      "y": 4.16
     },
     "O": {
      "x": 7.64,
      "y": 4.16
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {
     "S": 0.3,
     "O": 1.2,
     "H1": 0.3,
     "H2": 0.0,
     "M1": 0.3,
     "M2": 1.2
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.31,
      "y": 0.97
     },
     "M1": {
      "x": 4.61,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.57,
      "y": 4.16
     },
     "O": {
      "x": 7.64,
      "y": 4.16
     },
     "M2": {
      "x": 4.75,
      "y": 7.26
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "6-receive": {
  "passers": [
   "O",
   "H2",
   "M1"
  ],
  "steps": [
   {
    "title": "Stack",
    "caption": "Dieser Stack bringt Z nah an ihren Zuspielpunkt. A1 kann kurze Aufschläge decken oder ganz nach hinten rutschen und anstelle von D, A2 oder M1 annehmen. Überlege selbst, wie die relative Position erhalten bleibt.",
    "pos": {
     "M2": {
      "x": 0.86,
      "y": 0.6
     },
     "S": {
      "x": 5.95,
      "y": 0.76
     },
     "H1": {
      "x": 1.64,
      "y": 2.3
     },
     "O": {
      "x": 1.49,
      "y": 6.51
     },
     "M1": {
      "x": 7.5,
      "y": 6.45
     },
     "H2": {
      "x": 4.44,
      "y": 7.31
     }
    },
    "delays": {},
    "passers": [
     "O",
     "H2",
     "M1"
    ]
   },
   {
    "title": "Übergang zum Angriff",
    "caption": "Z geht zum Zuspielpunkt. M2 und A1 gehen zum Angriff, sobald der Aufschlag berührt ist. D, A2 und M1 nehmen zuerst an und gehen dann.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H1": {
      "x": -0.64,
      "y": 2.92
     },
     "M2": {
      "x": 4.1,
      "y": 2.8
     },
     "M1": {
      "x": 9.3,
      "y": 4.76
     },
     "O": {
      "x": 2.82,
      "y": 6.33
     },
     "H2": {
      "x": 6.57,
      "y": 6.26
     }
    },
    "delays": {
     "S": 0.0,
     "O": 1.3,
     "H1": 0.4,
     "H2": 1.3,
     "M1": 1.3,
     "M2": 0.4
    },
    "passers": [
     "O",
     "H2",
     "M1"
    ]
   },
   {
    "title": "Angriffsbereit",
    "caption": "M1 will aus dem Hinterfeld angreifen, nicht von vorn. Das Team ist angriffsbereit, mit drei Hauptoptionen. Sobald der Ball zugespielt ist, sichern die anderen die Angreiferin ab, falls sie geblockt wird. Grundidee: mindestens 2 Spieler sichern kurz, 2 stehen tief verteilt.",
    "pos": {
     "S": {
      "x": 6.66,
      "y": 0.95
     },
     "H1": {
      "x": -0.64,
      "y": 2.92
     },
     "M2": {
      "x": 4.1,
      "y": 2.8
     },
     "M1": {
      "x": 9.3,
      "y": 4.76
     },
     "O": {
      "x": 2.82,
      "y": 6.33
     },
     "H2": {
      "x": 6.57,
      "y": 6.26
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Absicherung",
    "caption": "Absicherung: Die Laufwege hängen davon ab, ob links, Mitte oder rechts angreift (im PDF rot, grün, blau). Hier siehst du die Grundstellung der Absicherung. Wer bei einem Angriff keinen Weg hat, bleibt trotzdem bereit, andere haben Vorrang.",
    "pos": {
     "S": {
      "x": 6.79,
      "y": 0.97
     },
     "M2": {
      "x": 3.89,
      "y": 2.57
     },
     "H1": {
      "x": -0.54,
      "y": 2.88
     },
     "M1": {
      "x": 9.41,
      "y": 5.03
     },
     "O": {
      "x": 2.51,
      "y": 6.61
     },
     "H2": {
      "x": 6.99,
      "y": 6.87
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Wechsel in die Abwehr",
    "caption": "Wo auch immer du landest, sobald dein Team den Ball über das Netz gebracht hat: wechsle auf deine Position in der Abwehr. Hier ein Beispiel für den Wechsel nach einem Angriff von links vorn.",
    "pos": {
     "H1": {
      "x": 0.98,
      "y": 0.79
     },
     "O": {
      "x": 1.17,
      "y": 2.5
     },
     "S": {
      "x": 7.23,
      "y": 0.77
     },
     "M2": {
      "x": 3.07,
      "y": 0.99
     },
     "M1": {
      "x": 7.72,
      "y": 4.4
     },
     "H2": {
      "x": 3.39,
      "y": 7.02
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.25,
      "y": 0.99
     },
     "M2": {
      "x": 4.42,
      "y": 0.84
     },
     "S": {
      "x": 7.63,
      "y": 0.84
     },
     "H2": {
      "x": 1.54,
      "y": 3.91
     },
     "O": {
      "x": 7.76,
      "y": 3.91
     },
     "M1": {
      "x": 4.78,
      "y": 7.23
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 },
 "6-serve": {
  "server": "M1",
  "passers": [],
  "steps": [
   {
    "title": "Stack vor dem Aufschlag",
    "caption": "Aufstellung vor dem Aufschlag. Die vordere Reihe stackt um M2. Ein Aufschläger außerhalb des Feldes muss nicht auf seine Position relativ zu den Mitspielern achten.",
    "pos": {
     "S": {
      "x": 7.5,
      "y": 0.94
     },
     "M2": {
      "x": 4.48,
      "y": 0.95
     },
     "H1": {
      "x": 5.19,
      "y": 1.97
     },
     "O": {
      "x": 3.9,
      "y": 4.48
     },
     "H2": {
      "x": 5.49,
      "y": 6.33
     },
     "M1": {
      "x": 7.96,
      "y": 9.91
     }
    },
    "delays": {},
    "passers": []
   },
   {
    "title": "Übergang zur Abwehr",
    "caption": "M1 schlägt auf und läuft auf ihre Abwehrposition. A2 und D gehen, achten dabei auf den Überpass. A1 wechselt sofort, wenn M1 aufschlägt.",
    "pos": {
     "H1": {
      "x": 1.31,
      "y": 0.95
     },
     "M2": {
      "x": 4.57,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.57,
      "y": 4.16
     },
     "O": {
      "x": 7.64,
      "y": 4.16
     },
     "M1": {
      "x": 4.66,
      "y": 7.17
     }
    },
    "delays": {
     "S": 0.3,
     "O": 0.3,
     "H1": 0.3,
     "H2": 0.3,
     "M1": 0.0,
     "M2": 0.3
    },
    "passers": []
   },
   {
    "title": "Grundposition Abwehr",
    "caption": "Das Team steht in der Grundposition für die Abwehr.",
    "pos": {
     "H1": {
      "x": 1.31,
      "y": 0.95
     },
     "M2": {
      "x": 4.57,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.57,
      "y": 4.16
     },
     "O": {
      "x": 7.64,
      "y": 4.16
     },
     "M1": {
      "x": 4.66,
      "y": 7.17
     }
    },
    "delays": {},
    "passers": []
   }
  ]
 }
};
  if (typeof module !== 'undefined') module.exports = { PDF_PLANS };
  else globalThis.VR = Object.assign(globalThis.VR || {}, { PDF_PLANS });
})();
