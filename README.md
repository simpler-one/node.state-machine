English | [日本語](README-jp.md)

# State Machine

[![npm version](https://badge.fury.io/js/%40working-sloth%2Fstate-machine.svg)](https://badge.fury.io/js/%40working-sloth%2Fstate-machine)
[![Build Status](https://travis-ci.org/work-work-komei/node.state-machine.svg?branch=develop)](https://travis-ci.org/work-work-komei/node.state-machine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/03db41b395194a168573c9b647f9db24)](https://app.codacy.com/app/work-work-komei/node.state-machine?utm_source=github.com&utm_medium=referral&utm_content=work-work-komei/node.state-machine&utm_campaign=Badge_Grade_Dashboard)
[![codecov](https://codecov.io/gh/work-work-komei/node.state-machine/branch/develop/graph/badge.svg)](https://codecov.io/gh/work-work-komei/node.state-machine)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

![StateMachine](https://github.com/work-work-komei/node.state-machine.samples/blob/master/src/1.quick-start/state.png?raw=true)

Diligent developer, is it your work to create state machine from scratch or take care of poor state machine?
Let's be lazy.
<table>
    <tr>
        <th>Poor state<br>(Before)</th>
        <td>
<pre>
if (fsm.current === 'Doing' || fsm.curent === 'Waiting' || ...) {
    showProgress();
}
<br>
if (fsm.current === 'Complete') {
    showResult();
}
if (fsm.current === 'Error') {
    showError();
}
if (fsm.current === 'Cancel') {
    showCanceled();
}
...
</pre>
        </td>
    </tr>
    <tr>
        <th>Rich state<br>(After)</th>
        <td>
<pre>
if (fsm.current.inProgress) {
    showProgress();
}
<br>
fsm.current.show();
</pre>
        </td>
    </tr>
</table>


## What? 
 Finite state machine for JavaScript and TypeScript.

## Why? 
- Readable: state machine definition is so readable that you easily understand transitions
- Generic typing: states, actions and optional params
- Rich object state: user defined class can be state
- State with life-cycle: create/dispose
- Export statecharts: PlantUML
- Learning cost: basic takes only 1 step, rich state takes only 2 more steps, full function takes only 3 more steps to learn

## Quick start
### case: String state (most simple)
```js
import { StateMachine } from '@working-sloth/state-machine';

enum SlothState {
    Idle = 'Idle',
    ...
}

enum SlothAction {
    Sleep = 'Sleep',
    ...
}

const fsm = StateMachine.fromString<SlothState, SlothAction>(
    'Sloth State', // state machine name
    SlothState.Idle, // start state
    {
        state: SlothState.Idle,
        transitions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Eat, SlothState.Eating],
        ]
    }, {
        state: SlothState.Sleeping,
        transitions: [
            [SlothAction.Wake, SlothState.Idle],
        ]
    },
    ...
);

fsm.start(); // Don't forget

console.log(fsm.current); // You can get current state

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}
```

### case: Named static state (rich state)
 I have a truly marvelous sample of this case which this margin is too narrow to contain.
 [See samples](https://github.com/work-work-komei/node.state-machine.samples/tree/master/src)

### case: Typed dynamic state (rich state with life cycle)
 I have a truly marvelous sample of this case which this margin is too narrow to contain.
 [See samples](https://github.com/work-work-komei/node.state-machine.samples/tree/master/src)

## Schedule
- Create string-based fsm from PlantUML: someday
- Crate docs: someday
- Export statecharts from CLI: someday
- Rest: every day
- Sleep: every day
- Be clever and lazy: soon
- Be stupid and diligent: never

## If you aren't satisfied
- [Open an issue](https://github.com/work-work-komei/node.state-machine/issues) such as "question" or "enhancement"
- e-mail: koba.work.work1127@gmail.com
