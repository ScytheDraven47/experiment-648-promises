Inspiration for Side-Effects:
- https://lackofimagination.org/2025/11/managing-side-effects-a-javascript-effect-system-in-30-lines-or-less/

# Code Examples

Side-Effects
- https://github.com/ScytheDraven47/experiment-648-promises/tree/effect-pipe 

Promises
- https://github.com/ScytheDraven47/experiment-648-promises/tree/promise-chain 

# Psuedocode

## Branching

```py
checkSomething()

if (something)
    checkSomethingElse()
    if (somethingElse)
        checkAnotherThing()
        if (anotherThing)
            # ...
    checkSomethingCompletelyDifferent()
    if (somethingCompletelyDifferent)
        checkAnotherThing() # again
        if (anotherThing) # again
            # ...
```

## Promise Chain

```js
new Promise(
  checkSomething()
).then(
  checkSomethingCompletelyDifferent()
).then(
  checkSomethingElse()
).catch(
  // handle errors
).finally(
  checkAnotherThing()
)
```

## Side-Effect Pipe

```js
effectPipe(
  checkSomething,
  () => checkSomethingElseCmd(),
  checkSomething,
  () => checkSomethingElseCmd(),
  checkSomethingElseEffect,
  () => checkAnotherThingCmd(),
  checkAnotherThingEffect,
)
```
