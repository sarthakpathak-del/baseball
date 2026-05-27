# TODO - UX Improvements (MicroSwing Baseball)

- [ ] Remove ScrollView wrapping gameplay in `App.tsx` to stabilize layout
- [ ] Add clear stage/status pill + improve mic UX feedback (listening/calibrating)
- [ ] Fix crowd flicker by precomputing crowd dot opacities once in `GameView.tsx`
- [ ] Reduce animation jank: prevent competing intervals, clear properly, and avoid excessive re-renders during flight
- [ ] Improve mic calibration/sensitivity controls in `ControlPanel.tsx` and threshold logic in `useMicLevel.ts`
- [ ] Add accessibility labels/roles for primary actions and modal buttons
- [ ] Run tests/lint (if available) and perform manual gameplay checks

