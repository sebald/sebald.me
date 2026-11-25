---
'@sebald/blip-ui': minor
---

Stepper, the form's one choice control (`Music ◀ On ▶`): a `Field` holding a `StepperControl`, `['Off', 'On']` a switch, other values a slider that says its value; Up and Down are the `Form`'s. `Switch` is removed: use `<Stepper values={['Off', 'On']}>`. A stepper's and a `PickerSetting`'s step arrows show only on the row Left and Right reach (always under a finger), and a stepper takes its column's width, the value centred between them.
