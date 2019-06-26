# State Machine

[![npm version](https://badge.fury.io/js/%40working-sloth%2Fstate-machine.svg)](https://badge.fury.io/js/%40working-sloth%2Fstate-machine)
[![Build Status](https://travis-ci.org/work-work-komei/node.state-machine.svg?branch=develop)](https://travis-ci.org/work-work-komei/node.state-machine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/03db41b395194a168573c9b647f9db24)](https://app.codacy.com/app/work-work-komei/node.state-machine?utm_source=github.com&utm_medium=referral&utm_content=work-work-komei/node.state-machine&utm_campaign=Badge_Grade_Dashboard)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

![StateMachine](samples/1.quick-start/state.png)

[日本語](README-jp.md)

Note: Current version is beta.

Diligent developer, is it your work to create state machine from scratch or take care of poor state machine?
Let's be lazy.
<table>
    <tr>
        <th>Poor state (Before)</th>
        <th>Rich State (After)</th>
    </tr>
    <tr>
        <td valign="top">
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
        <td valign="top">
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
- Simple: easy to understand usage and provide shorter codes
- Generic typing: states, actions and optional params
- Rich object state: user defined class can be state
- State with life-cycle: create/dispose
- Export statecharts: PlantUML

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
        actions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Eat, SlothState.Eating],
        ]
    }, {
        state: SlothState.Sleeping,
        actions: [
            [SlothAction.Wake, SlothState.Idle],
        ]
    },
    ...
);

console.log(fsm.current);

fsm.start(); // Don't forget

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}
```

### case: Named static state (rich state)
 I have a truly marvelous sample of this case which this margin is too narrow to contain.
 [See samples](samples)

### case: Typed dynamic state (rich state with life cycle)
 I have a truly marvelous sample of this case which this margin is too narrow to contain.
 [See samples](samples)

## Schedule
- Create string-based fsm from PlantUML: someday
- State nesting: someday
- Check coverage: someday
- Crate docs: someday
- Release v1.0: someday
- Rest: every day
- Sleep: every day
- Be clever and lazy: soon
- Be stupid and diligent: never

## If you aren't satisfied
 contact: koba.work.work1127@gmail.com
