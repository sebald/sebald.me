---
'@sebald/blip-ui': minor
---

Stepper, the form's one choice control (`Music ◀ On ▶`): a `Field` holding a `StepperControl`, `['Off', 'On']` a switch, other values a slider that says its value; Up and Down are the `Form`'s. `Switch` is removed: use `<Stepper values={['Off', 'On']}>`. A stepper's and a `PickerSetting`'s step arrows show only on the row Left and Right reach (always under a finger), and a stepper takes its column's width, the value centred between them; its description and error start at the label and take the row's width, as a setting's; its name and value stay on one line on a tall stage too. A control can mark its own focus (`data-marks-focus`), and its `Field` then shows no cursor: a stepper's focus is its primary arrows.
