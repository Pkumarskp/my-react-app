# Hands-On Exercises Quick Guide

Complete these exercises to be interview-ready with HANDS-ON experience.

## Exercise List by Difficulty

### Easy (Do First - Foundation)
1. **useAsync Hook** - Custom hook for async data fetching
   - Patterns: State machine, error handling, cleanup
   - Time: 30 mins
   
2. **Error Boundary Testing** - Wrap routes with error boundaries
   - Patterns: Error recovery, fallback UI
   - Time: 20 mins
   
3. **Redux DevTools Debugging** - Master Redux inspector
   - Patterns: Time-travel debugging, action inspection
   - Time: 15 mins

### Medium (Build Understanding)
4. **useCart Hook** - Encapsulate Redux cart logic
   - Patterns: Redux abstraction, custom hooks
   - Time: 45 mins
   
5. **Performance Refactor** - Add React.memo + useCallback
   - Patterns: Memoization, performance debugging
   - Time: 1 hour
   
6. **Form Handling** - Build useForm hook with validation
   - Patterns: Form state, controlled components, validation
   - Time: 1 hour
   
7. **State Management Comparison** - Redux vs Context decision
   - Patterns: Architectural thinking
   - Time: 1.5 hours
   
8. **Code Splitting Verification** - Analyze bundle splitting
   - Patterns: Lazy loading, Suspense, bundle analysis
   - Time: 30 mins
   
9. **Testing Components** - Write hook/component tests
   - Patterns: Unit testing, mocking, assertions
   - Time: 1.5 hours

### Hard (Master Interview Topics)
10. **Class to Hooks Understanding** - Why ErrorBoundary is class
    - Patterns: Advanced hooks vs class, library alternatives
    - Time: 1 hour
    
11. **Complete Auth Feature** - Full end-to-end feature
    - Patterns: Redux thunks, HOCs, protected routes, storage
    - Time: 2-3 hours
    
12. **Implement Caching** - Smart cache with timestamp
    - Patterns: Advanced async, getState in thunks, optimization
    - Time: 1.5 hours

---

## Weekly Plan to Interview-Ready

### Week 1: Foundations
- Day 1-2: Exercises 1, 2, 3 (Easy ones)
- Day 3-4: Exercise 4 (useCart Hook)
- Day 5: Exercise 9 (Testing setup)
- Review: Understand why you did each exercise

### Week 2: Core Skills
- Day 1-2: Exercise 5 (Performance Refactor)
- Day 3-4: Exercise 6 (Form Handling)
- Day 5: Exercise 8 (Code Splitting)
- Review: Test yourself on Fundamentals section

### Week 3: Advanced
- Day 1-3: Exercise 7 (State Management Comparison)
- Day 4-5: Exercise 11 (Build Auth Feature)
- Weekend: Deep practice on that feature

### Week 4: Polish
- Day 1-2: Exercise 12 (Caching Strategy)
- Day 3-5: Mock interviews, explaining each exercise
- Weekend: Review weak areas

---

## What Interviewers Will Ask About Each Exercise

### After Exercise 1 (useAsync):
- "How would you handle race conditions in async calls?"
- "What if the component unmounts during fetch?"

### After Exercise 4 (useCart):
- "Why abstract Redux logic into a hook?"
- "How does this help with testing?"

### After Exercise 5 (Performance):
- "How do you measure if optimization worked?"
- "When would you NOT use React.memo?"

### After Exercise 6 (Forms):
- "What about server-side validation?"
- "How would you handle file uploads?"

### After Exercise 7 (State Management):
- "Walk me through your decision tree"
- "When would you change your choice?"

### After Exercise 11 (Auth):
- "How do you handle token refresh?"
- "What about CORS issues?"
- "How do you prevent XSS?"

### After Exercise 12 (Caching):
- "What if data becomes stale?"
- "How would you implement cache invalidation?"

---

## How to Explain These in Interviews

**Template for Each Exercise:**

1. **Problem** - What issue were you solving?
2. **Approach** - How did you think through it?
3. **Implementation** - Show the code you wrote
4. **Challenges** - What was tricky?
5. **What You Learned** - Pattern or principle you discovered
6. **Alternative** - What else could you have done?

**Example:**

**Exercise 5 - Performance Refactor**

> "I identified that ProductCard was re-rendering unnecessarily every time the parent Shop component rendered. I wrapped it with React.memo to prevent re-renders when props haven't changed. But I discovered that the parent was passing inline functions as props, which are new references every render, so memo didn't help. I extracted those functions to useCallback with proper dependencies. I measured improvement using why-did-you-render library. Now ProductCard only re-renders when product data or callback functions actually change. The lesson: memoization is only useful when you control prop identity."

That's a complete, interview-ready answer showing depth.

---

## Quick Wins for Interviews

Do these quick exercises right before interviews to warm up:

**15-min Refresher:**
1. Code-split a route (lazy + Suspense)
2. Write a Redux selector
3. Create a custom hook skeleton
4. Explain Redux vs Context for a given scenario

**30-min Deep Dive:**
1. Refactor a component for performance
2. Add error handling to a function
3. Write a form hook from scratch
4. Debug Redux with DevTools

**1-hour Mock:**
1. Build a feature: search with filters
2. Add error boundaries
3. Write unit tests
4. Explain architectural choices

---

## Track Your Progress

After completing each exercise, you can answer:

- [ ] Can I explain this code to someone?
- [ ] Could I write this from scratch tomorrow?
- [ ] Do I understand why this pattern matters?
- [ ] Can I explain trade-offs with alternatives?

If YES to all 4 → You own this topic
If NO to any → Review that exercise

---

## Resources for Each Exercise

### Exercise 1-2 (Custom Hooks)
- React docs: https://react.dev/reference/react/hooks
- Custom hooks guide: https://react.dev/learn/reusing-logic-with-custom-hooks

### Exercise 3-5 (Performance)
- React.memo: https://react.dev/reference/react/memo
- useCallback: https://react.dev/reference/react/useCallback
- why-did-you-render: https://github.com/welldone-software/why-did-you-render

### Exercise 6 (Testing)
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Vitest: https://vitest.dev/

### Exercise 7 (Redux)
- Redux docs: https://redux.js.org/
- Redux Toolkit: https://redux-toolkit.js.org/
- Redux DevTools: https://github.com/reduxjs/redux-devtools

### Exercise 11 (Auth)
- JWT auth patterns: https://jwt.io/introduction
- Secure storage: https://cheatsheetseries.owasp.org/
- Protected routes: https://reactrouter.com/

---

## Estimated Total Time to Completion

- **Easy Exercises**: ~1.5 hours
- **Medium Exercises**: ~5 hours
- **Hard Exercises**: ~4.5 hours
- **Review & Practice**: ~3 hours
- **Mock Interviews**: ~3 hours

**Total: ~17 hours to interview-ready hands-on competency**

Do 2-3 hours per day and you'll be ready in ~1 week.

---

## Common Mistakes While Doing Exercises

❌ **Copying code without understanding**
→ Type it out yourself, don't copy-paste

❌ **Skipping error cases**
→ Every exercise should handle errors

❌ **Not testing your code**
→ Run it and break it on purpose

❌ **Forgetting cleanup**
→ useEffect cleanup, event listeners, timers

❌ **Missing dependencies**
→ Check useEffect deps arrays

---

Good luck! Complete these and you'll be confident discussing React in any interview. 🚀
