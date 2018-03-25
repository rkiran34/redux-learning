// Passing store down using ReactRedux provider component

/*

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/redux/3.7.2/redux.js"></script>
  <script src="https://fb.me/react-15.1.0.js"></script>
  <script src="https://fb.me/react-dom-15.1.0.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/expect/1.20.2/expect.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-redux/5.0.7/react-redux.js"></script>
  <script src="https://wzrd.in/standalone/deep-freeze@latest"></script>
  </head>
<body>
  
  <div id="root"></div>
</body>
</html>

*/


const todo = (state, action) => 
{
  switch(action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id === action.id) {
        return {...state, completed: !state.completed }
      } else {
        return state;
      }
    default: 
      return state;
  }
}

const todos = (state = [], action) => {
  switch(action.type) {
    case 'ADD_TODO':
      // reducer composition - calling reducer from another
      return [...state, todo(undefined, action)];
    case 'TOGGLE_TODO':
      return state.map(s => todo(s, action));
    default:
      return state;
  }
};

const visibilityFilter = (
  state = 'SHOW_ALL', 
  action
) => {
  switch (action.type)
  {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const { combineReducers } = Redux;
const todoApp = combineReducers({
  todos: todos,
  visibilityFilter: visibilityFilter
});

const { Component } = React;

const Link = ({
  active,
  children,
  onClick
}) => {
  if(active) {
    return <span>{children}</span>
  }
  return (
    <a href='#'
      onClick={e => {
      e.preventDefault();
      onClick(); 
    }}
    >
      {children}
    </a>
  );
};


// Container component
class FilterLink extends Component {
  
	componentDidMount() {
		const { store } = this.context;
		this.unsubscribe = store.subscribe(() =>
			this.forceUpdate()
		);
	}
	  
	componentWillUnmount() {
		this.unsubscribe();
	}
	  
  render() {
    const props = this.props;
	const { store } = this.context;
    const state = store.getState();
    
    return (
      <Link
        active={
          props.filter ===
          state.visibilityFilter
        }
        onClick={() => 
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
        {props.children}
      </Link>
    );
  }
}
FilterLink.contextTypes = {
	store: React.PropTypes.object
};

const Footer = () => (
        <p>
          Show:
          {' '}
          <FilterLink
            filter='SHOW_ALL'
			>
            All
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_ACTIVE'
			>
            Active
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_COMPLETED'
			>
                Completed
          </FilterLink>
            {' '}
        </p>
)

// This is a presentational component
const Todo = ({
  onClick,
  completed,
  text
}) => (
	<li
	  onClick={onClick}
	style={{
	  textDecoration:
		   completed 
		   ? 'line-through'
		   : 'none'
	}}>
		{text}
	</li>
);

// another presentational component
const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => 
       <Todo
         key={todo.id}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
      />
     )}
  </ul>
);

// functional component
const AddTodo = (props, { store }) => {
  let input;
  
  return (
	  <div>
		<input 
		  ref={node => {
		  input = node;
		  }} />
		<button onClick={() => {
            store.dispatch({
              type: 'ADD_TODO',
              id: nextTodoId++,
              text: input.value
            })
			input.value = '';
		  }}>
		  Add Todo
		</button>
	  </div>
  );
};
AddTodo.contextTypes = {
	store: React.PropTypes.object
};

const getVisibleTodos = (
  todos, filter
) => {
  switch(filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
  }
}


/* the job of a container component is to connect 
	the presentational component to the Redux store */
class VisibleTodoList extends Component {
	
	componentDidMount() {
		const { store } = this.context;
		this.unsubscribe = store.subscribe(() =>
		  this.forceUpdate()
		);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const props = this.props
		const { store } = this.context;
		const state = store.getState();
		
		return (
			<TodoList
				todos = {
					getVisibleTodos(
						state.todos,
						state.visibilityFilter
						)
				}
				onTodoClick={id => 
					store.dispatch({
						type: 'TOGGLE_TODO',
						id
					})
				}
			/>
		);
	}
}
VisibleTodoList.contextTypes = {
	store: React.PropTypes.object
}

let nextTodoId = 0;

// Container component
const TodoApp = () => 
(
	<div>
		<AddTodo />
		<VisibleTodoList />
		<Footer />
	</div>
);

/*
class Provider extends Component {

	getChildContext() {
		// Return context to children using the getChildContext function
		// The context has single property store. In this case the store from props is assigned to the store property
		// The props are specified in the HTML tag of Provider.
		return {
			store: this.props.store
		};
	}
	
	// Use the render function to render the children (specified in the HTML)
	render() {
		return this.props.children;
	}
}
// Specify that getChildContext is matched by childContextTypes. This says that the store is required.
Provider.childContextTypes = {
	store: React.PropTypes.object
}
 */
const { createStore } = Redux;

/* Provider component will use React advanced Context feature to make store available for any component within Provider component */
ReactDOM.render(
	<Provider store={ createStore(todoApp) }>
		<TodoApp />
	</Provider>,
	document.getElementById('root')
);

