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
      "x": 2.3,
      "y": 0.92
     },
     "H1": {
      "x": 7.75,
      "y": 1.0
     },
     "S": {
      "x": 7.84,
      "y": 2.2
     },
     "O": {
      "x": 1.4,
      "y": 6.55
     },
     "M1": {
      "x": 6.87,
      "y": 7.07
     },
     "H2": {
      "x": 4.24,
      "y": 7.65
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
      "x": 5.11,
      "y": 1.11
     },
     "M2": {
      "x": 2.52,
      "y": 2.82
     },
     "O": {
      "x": -1.9,
      "y": 3.03
     },
     "H1": {
      "x": 7.67,
      "y": 2.85
     },
     "H2": {
      "x": 0.96,
      "y": 6.62
     },
     "M1": {
      "x": 5.17,
      "y": 7.02
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
      "x": 5.11,
      "y": 1.11
     },
     "M2": {
      "x": 2.52,
      "y": 2.82
     },
     "O": {
      "x": -1.9,
      "y": 3.03
     },
     "H1": {
      "x": 7.67,
      "y": 2.85
     },
     "H2": {
      "x": 0.96,
      "y": 6.62
     },
     "M1": {
      "x": 5.17,
      "y": 7.02
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
      "x": 6.48,
      "y": 0.52
     },
     "O": {
      "x": -0.57,
      "y": 2.28
     },
     "M2": {
      "x": 3.84,
      "y": 2.14
     },
     "H1": {
      "x": 9.25,
      "y": 2.04
     },
     "H2": {
      "x": 2.54,
      "y": 5.95
     },
     "M1": {
      "x": 6.89,
      "y": 6.44
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
      "x": 0.04,
      "y": 0.32
     },
     "S": {
      "x": 6.27,
      "y": 0.32
     },
     "M2": {
      "x": 2.18,
      "y": 0.61
     },
     "H2": {
      "x": 0.53,
      "y": 2.12
     },
     "H1": {
      "x": 6.64,
      "y": 3.66
     },
     "M1": {
      "x": 3.1,
      "y": 6.24
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
      "x": 0.41,
      "y": 0.61
     },
     "M2": {
      "x": 3.27,
      "y": 0.42
     },
     "O": {
      "x": 6.01,
      "y": 0.39
     },
     "H2": {
      "x": 0.49,
      "y": 3.25
     },
     "S": {
      "x": 6.17,
      "y": 3.25
     },
     "M1": {
      "x": 3.42,
      "y": 6.41
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
      "x": 3.4,
      "y": 1.77
     },
     "M2": {
      "x": 4.55,
      "y": 0.88
     },
     "H1": {
      "x": 5.73,
      "y": 2.47
     },
     "H2": {
      "x": 2.22,
      "y": 5.55
     },
     "M1": {
      "x": 6.23,
      "y": 6.01
     },
     "S": {
      "x": 7.92,
      "y": 10.2
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
      "x": 1.59,
      "y": 0.86
     },
     "M2": {
      "x": 4.56,
      "y": 0.87
     },
     "O": {
      "x": 7.32,
      "y": 0.87
     },
     "H2": {
      "x": 1.73,
      "y": 4.27
     },
     "S": {
      "x": 7.39,
      "y": 4.29
     },
     "M1": {
      "x": 4.72,
      "y": 7.43
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
      "x": 1.59,
      "y": 0.86
     },
     "M2": {
      "x": 4.56,
      "y": 0.87
     },
     "O": {
      "x": 7.32,
      "y": 0.87
     },
     "H2": {
      "x": 1.73,
      "y": 4.27
     },
     "S": {
      "x": 7.39,
      "y": 4.29
     },
     "M1": {
      "x": 4.72,
      "y": 7.43
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
      "x": 6.76,
      "y": 0.97
     },
     "S": {
      "x": 5.85,
      "y": 1.81
     },
     "M2": {
      "x": 7.67,
      "y": 2.65
     },
     "H2": {
      "x": 1.59,
      "y": 6.31
     },
     "H1": {
      "x": 7.43,
      "y": 6.15
     },
     "M1": {
      "x": 4.46,
      "y": 7.12
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M2": {
      "x": 2.55,
      "y": 2.79
     },
     "O": {
      "x": 7.71,
      "y": 2.75
     },
     "M1": {
      "x": 1.15,
      "y": 6.32
     },
     "H1": {
      "x": 5.14,
      "y": 6.55
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M2": {
      "x": 2.55,
      "y": 2.79
     },
     "O": {
      "x": 7.71,
      "y": 2.75
     },
     "M1": {
      "x": 1.15,
      "y": 6.32
     },
     "H1": {
      "x": 5.14,
      "y": 6.55
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
      "x": 6.48,
      "y": 0.52
     },
     "M2": {
      "x": 3.87,
      "y": 2.09
     },
     "H2": {
      "x": -0.38,
      "y": 2.23
     },
     "O": {
      "x": 8.87,
      "y": 2.23
     },
     "M1": {
      "x": 2.46,
      "y": 5.95
     },
     "H1": {
      "x": 6.75,
      "y": 6.26
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
      "x": 0.22,
      "y": 0.36
     },
     "M1": {
      "x": 0.73,
      "y": 2.16
     },
     "S": {
      "x": 6.27,
      "y": 0.33
     },
     "M2": {
      "x": 2.18,
      "y": 0.8
     },
     "O": {
      "x": 6.34,
      "y": 3.73
     },
     "H1": {
      "x": 2.89,
      "y": 6.55
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
      "x": 3.09,
      "y": 0.4
     },
     "H2": {
      "x": 0.06,
      "y": 0.4
     },
     "O": {
      "x": 6.01,
      "y": 0.4
     },
     "H1": {
      "x": 0.01,
      "y": 3.27
     },
     "S": {
      "x": 6.17,
      "y": 3.29
     },
     "M1": {
      "x": 3.42,
      "y": 6.41
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
      "x": 1.42,
      "y": 0.87
     },
     "M2": {
      "x": 4.72,
      "y": 0.88
     },
     "O": {
      "x": 3.59,
      "y": 1.77
     },
     "S": {
      "x": 6.52,
      "y": 5.4
     },
     "M1": {
      "x": 3.15,
      "y": 6.07
     },
     "H1": {
      "x": 7.89,
      "y": 9.91
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
      "x": 4.5,
      "y": 0.87
     },
     "H2": {
      "x": 1.36,
      "y": 0.91
     },
     "O": {
      "x": 7.64,
      "y": 0.91
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "S": {
      "x": 7.39,
      "y": 4.29
     },
     "M1": {
      "x": 4.72,
      "y": 7.43
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
      "x": 4.5,
      "y": 0.87
     },
     "H2": {
      "x": 1.36,
      "y": 0.91
     },
     "O": {
      "x": 7.64,
      "y": 0.91
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "S": {
      "x": 7.39,
      "y": 4.29
     },
     "M1": {
      "x": 4.72,
      "y": 7.43
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
      "x": 0.83,
      "y": 0.97
     },
     "S": {
      "x": 0.87,
      "y": 2.04
     },
     "O": {
      "x": 7.75,
      "y": 2.32
     },
     "H2": {
      "x": 1.72,
      "y": 6.31
     },
     "M2": {
      "x": 7.09,
      "y": 6.34
     },
     "H1": {
      "x": 4.22,
      "y": 7.21
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M1": {
      "x": 2.78,
      "y": 2.75
     },
     "O": {
      "x": 7.71,
      "y": 2.75
     },
     "H1": {
      "x": 1.27,
      "y": 6.15
     },
     "M2": {
      "x": 4.72,
      "y": 6.25
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M1": {
      "x": 2.78,
      "y": 2.75
     },
     "O": {
      "x": 7.71,
      "y": 2.75
     },
     "H1": {
      "x": 1.27,
      "y": 6.15
     },
     "M2": {
      "x": 4.72,
      "y": 6.25
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
      "x": 6.48,
      "y": 0.52
     },
     "M1": {
      "x": 3.77,
      "y": 2.18
     },
     "H2": {
      "x": -0.38,
      "y": 2.23
     },
     "O": {
      "x": 8.87,
      "y": 2.23
     },
     "H1": {
      "x": 2.57,
      "y": 5.99
     },
     "M2": {
      "x": 6.68,
      "y": 6.23
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
      "x": 0.22,
      "y": 0.36
     },
     "H1": {
      "x": 0.7,
      "y": 2.07
     },
     "S": {
      "x": 6.27,
      "y": 0.33
     },
     "M1": {
      "x": 2.23,
      "y": 0.75
     },
     "O": {
      "x": 6.34,
      "y": 3.73
     },
     "M2": {
      "x": 2.37,
      "y": 6.51
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
      "x": 3.2,
      "y": 0.35
     },
     "H2": {
      "x": 0.06,
      "y": 0.4
     },
     "O": {
      "x": 6.01,
      "y": 0.4
     },
     "H1": {
      "x": 0.01,
      "y": 3.27
     },
     "S": {
      "x": 6.17,
      "y": 3.29
     },
     "M2": {
      "x": 3.27,
      "y": 6.61
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
      "x": 4.63,
      "y": 0.78
     },
     "O": {
      "x": 7.71,
      "y": 0.85
     },
     "H2": {
      "x": 5.73,
      "y": 1.74
     },
     "S": {
      "x": 4.05,
      "y": 4.29
     },
     "H1": {
      "x": 5.44,
      "y": 5.79
     },
     "M2": {
      "x": 7.87,
      "y": 9.93
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
      "x": 1.36,
      "y": 0.97
     },
     "O": {
      "x": 7.64,
      "y": 0.97
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "S": {
      "x": 7.52,
      "y": 4.22
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 1.36,
      "y": 0.97
     },
     "O": {
      "x": 7.64,
      "y": 0.97
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "S": {
      "x": 7.52,
      "y": 4.22
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 0.76,
      "y": 0.93
     },
     "M1": {
      "x": 1.29,
      "y": 1.73
     },
     "H2": {
      "x": 1.95,
      "y": 2.55
     },
     "H1": {
      "x": 1.68,
      "y": 6.21
     },
     "O": {
      "x": 7.17,
      "y": 6.25
     },
     "M2": {
      "x": 4.34,
      "y": 7.04
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M1": {
      "x": 2.78,
      "y": 2.75
     },
     "O": {
      "x": 7.57,
      "y": 4.83
     },
     "H1": {
      "x": 1.27,
      "y": 6.15
     },
     "M2": {
      "x": 4.72,
      "y": 6.25
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
      "x": 5.11,
      "y": 1.11
     },
     "H2": {
      "x": -1.7,
      "y": 2.75
     },
     "M1": {
      "x": 2.78,
      "y": 2.75
     },
     "O": {
      "x": 7.57,
      "y": 4.83
     },
     "H1": {
      "x": 1.27,
      "y": 6.15
     },
     "M2": {
      "x": 4.72,
      "y": 6.25
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
      "x": 6.48,
      "y": 0.52
     },
     "H2": {
      "x": -0.38,
      "y": 2.3
     },
     "M1": {
      "x": 3.77,
      "y": 2.18
     },
     "O": {
      "x": 8.87,
      "y": 4.37
     },
     "H1": {
      "x": 2.57,
      "y": 5.99
     },
     "M2": {
      "x": 6.68,
      "y": 6.23
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
      "x": 2.23,
      "y": 0.75
     },
     "H2": {
      "x": 0.22,
      "y": 0.36
     },
     "H1": {
      "x": 0.7,
      "y": 2.07
     },
     "S": {
      "x": 6.27,
      "y": 0.33
     },
     "O": {
      "x": 6.26,
      "y": 3.9
     },
     "M2": {
      "x": 2.37,
      "y": 6.51
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
      "x": 0.06,
      "y": 0.4
     },
     "M1": {
      "x": 3.2,
      "y": 0.35
     },
     "S": {
      "x": 6.04,
      "y": 0.36
     },
     "H1": {
      "x": 0.01,
      "y": 3.27
     },
     "O": {
      "x": 6.16,
      "y": 3.33
     },
     "M2": {
      "x": 3.27,
      "y": 6.61
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
      "x": 4.69,
      "y": 0.78
     },
     "S": {
      "x": 3.31,
      "y": 1.58
     },
     "H2": {
      "x": 5.98,
      "y": 2.29
     },
     "H1": {
      "x": 2.41,
      "y": 5.61
     },
     "M2": {
      "x": 6.45,
      "y": 6.23
     },
     "O": {
      "x": 8.08,
      "y": 9.9
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
      "x": 1.36,
      "y": 1.0
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "O": {
      "x": 7.64,
      "y": 4.2
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 1.36,
      "y": 1.0
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H1": {
      "x": 1.59,
      "y": 4.2
     },
     "O": {
      "x": 7.64,
      "y": 4.2
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 5.68,
      "y": 0.93
     },
     "H1": {
      "x": 1.4,
      "y": 2.4
     },
     "M1": {
      "x": 6.81,
      "y": 2.44
     },
     "H2": {
      "x": 7.22,
      "y": 6.07
     },
     "M2": {
      "x": 1.4,
      "y": 6.34
     },
     "O": {
      "x": 4.29,
      "y": 7.36
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
      "x": 5.11,
      "y": 1.11
     },
     "H1": {
      "x": -1.86,
      "y": 2.87
     },
     "M1": {
      "x": 2.78,
      "y": 2.87
     },
     "M2": {
      "x": 1.43,
      "y": 6.04
     },
     "H2": {
      "x": 7.66,
      "y": 4.77
     },
     "O": {
      "x": 5.02,
      "y": 5.84
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
      "x": 5.11,
      "y": 1.11
     },
     "H1": {
      "x": -1.86,
      "y": 2.87
     },
     "M1": {
      "x": 2.78,
      "y": 2.87
     },
     "M2": {
      "x": 1.43,
      "y": 6.04
     },
     "H2": {
      "x": 7.66,
      "y": 4.77
     },
     "O": {
      "x": 5.02,
      "y": 5.84
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
      "x": 6.48,
      "y": 0.52
     },
     "H1": {
      "x": -0.52,
      "y": 2.26
     },
     "M1": {
      "x": 3.77,
      "y": 2.26
     },
     "H2": {
      "x": 9.07,
      "y": 4.29
     },
     "M2": {
      "x": 2.55,
      "y": 5.92
     },
     "O": {
      "x": 6.68,
      "y": 6.26
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
      "x": 2.23,
      "y": 0.75
     },
     "H1": {
      "x": 0.3,
      "y": 0.35
     },
     "M2": {
      "x": 0.3,
      "y": 2.16
     },
     "S": {
      "x": 6.27,
      "y": 0.33
     },
     "H2": {
      "x": 6.59,
      "y": 3.84
     },
     "O": {
      "x": 2.54,
      "y": 6.15
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
      "x": -0.06,
      "y": 0.4
     },
     "M1": {
      "x": 3.2,
      "y": 0.4
     },
     "S": {
      "x": 6.04,
      "y": 0.42
     },
     "H2": {
      "x": 0.22,
      "y": 3.33
     },
     "O": {
      "x": 6.16,
      "y": 3.33
     },
     "M2": {
      "x": 3.27,
      "y": 6.61
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
      "x": 1.24,
      "y": 0.83
     },
     "M1": {
      "x": 4.69,
      "y": 0.83
     },
     "S": {
      "x": 3.31,
      "y": 1.58
     },
     "O": {
      "x": 6.66,
      "y": 5.52
     },
     "M2": {
      "x": 2.93,
      "y": 6.17
     },
     "H2": {
      "x": 7.95,
      "y": 10.04
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
      "x": 1.29,
      "y": 0.97
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.55,
      "y": 4.17
     },
     "O": {
      "x": 7.64,
      "y": 4.17
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 1.29,
      "y": 0.97
     },
     "M1": {
      "x": 4.6,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.55,
      "y": 4.17
     },
     "O": {
      "x": 7.64,
      "y": 4.17
     },
     "M2": {
      "x": 4.74,
      "y": 7.28
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
      "x": 0.82,
      "y": 0.78
     },
     "S": {
      "x": 5.68,
      "y": 0.93
     },
     "H1": {
      "x": 1.57,
      "y": 2.4
     },
     "O": {
      "x": 1.42,
      "y": 6.42
     },
     "M1": {
      "x": 7.16,
      "y": 6.36
     },
     "H2": {
      "x": 4.24,
      "y": 7.18
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
      "x": 5.11,
      "y": 1.11
     },
     "H1": {
      "x": -1.86,
      "y": 2.99
     },
     "M2": {
      "x": 2.66,
      "y": 2.87
     },
     "M1": {
      "x": 7.64,
      "y": 4.75
     },
     "O": {
      "x": 1.45,
      "y": 6.25
     },
     "H2": {
      "x": 5.02,
      "y": 6.18
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
      "x": 5.11,
      "y": 1.11
     },
     "H1": {
      "x": -1.86,
      "y": 2.99
     },
     "M2": {
      "x": 2.66,
      "y": 2.87
     },
     "M1": {
      "x": 7.64,
      "y": 4.75
     },
     "O": {
      "x": 1.45,
      "y": 6.25
     },
     "H2": {
      "x": 5.02,
      "y": 6.18
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
      "x": 6.48,
      "y": 0.52
     },
     "M2": {
      "x": 3.71,
      "y": 2.05
     },
     "H1": {
      "x": -0.52,
      "y": 2.35
     },
     "M1": {
      "x": 8.99,
      "y": 4.4
     },
     "O": {
      "x": 2.4,
      "y": 5.91
     },
     "H2": {
      "x": 6.68,
      "y": 6.16
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
      "x": 0.3,
      "y": 0.35
     },
     "O": {
      "x": 0.48,
      "y": 1.98
     },
     "S": {
      "x": 6.27,
      "y": 0.33
     },
     "M2": {
      "x": 2.3,
      "y": 0.54
     },
     "M1": {
      "x": 6.74,
      "y": 3.8
     },
     "H2": {
      "x": 2.61,
      "y": 6.3
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
      "x": -0.06,
      "y": 0.54
     },
     "M2": {
      "x": 2.98,
      "y": 0.4
     },
     "S": {
      "x": 6.04,
      "y": 0.4
     },
     "H2": {
      "x": 0.22,
      "y": 3.33
     },
     "O": {
      "x": 6.16,
      "y": 3.33
     },
     "M1": {
      "x": 3.32,
      "y": 6.5
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
      "x": 7.49,
      "y": 0.94
     },
     "M2": {
      "x": 4.47,
      "y": 0.95
     },
     "H1": {
      "x": 5.18,
      "y": 1.98
     },
     "O": {
      "x": 3.88,
      "y": 4.49
     },
     "H2": {
      "x": 5.48,
      "y": 6.35
     },
     "M1": {
      "x": 7.96,
      "y": 9.94
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
      "x": 1.29,
      "y": 0.95
     },
     "M2": {
      "x": 4.56,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.55,
      "y": 4.17
     },
     "O": {
      "x": 7.64,
      "y": 4.17
     },
     "M1": {
      "x": 4.64,
      "y": 7.19
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
      "x": 1.29,
      "y": 0.95
     },
     "M2": {
      "x": 4.56,
      "y": 0.97
     },
     "S": {
      "x": 7.64,
      "y": 0.97
     },
     "H2": {
      "x": 1.55,
      "y": 4.17
     },
     "O": {
      "x": 7.64,
      "y": 4.17
     },
     "M1": {
      "x": 4.64,
      "y": 7.19
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
