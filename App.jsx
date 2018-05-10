import React from 'react';
import axios from 'axios';
import {
	Layout,
	Page,
	Card,
	Link,
	Button,
	FormLayout,
	TextField,
	AppProvider,
	TextStyle,
	Tabs,
	List,
	Form,
	Collapsible,
	Spinner,
	Stack,
	Badge
} from '@shopify/polaris';

const allJokes = []; // stores jokes that have already been retrieved.

class App extends React.Component {

	render() {

		return (
			<AppProvider>
				<Page title="React/Polaris fun" separator>
					<Layout>

						<Layout.Section>
							<GetJokeTabbed />
							<JokeSearch />
						</Layout.Section>

						<Layout.Section>

						<Stack>
							<Badge>
								<Link url="https://github.com/atalkingcat/reactDadJokes" external="true">Page Source</Link>
							</Badge>
							<Badge>
								<Link url="https://icanhazdadjoke.com/api" external="true">Joke API</Link>
							</Badge>
						</Stack>

						</Layout.Section>

					</Layout>
				</Page>
			</AppProvider>

		);
	}
};

/*
*	Lists the jokes that have already been fetched for reference.
*/
class OldJokes extends React.Component {

	render() {

		var listItems = allJokes.map((joke) =>
			<List.Item>{joke}</List.Item>
		);

		return (

			<List type="bullet">
				{listItems}
			</List>
		)
	}
};

/*
*	Creates a card that can get a single joke.
*/
class GetDadJoke extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			joke: '',
			inProgress: false,
			buttonLabel: "Sure",
			buttonLabels: ["Again!", "Moar Plz", "Get me another!", "-groan-", "One more time"],
			opened: false
		}

		this.getJoke = this.getJoke.bind(this);
		this.getRandomLabel = this.getRandomLabel.bind(this);
	};

	getRandomLabel(){
		var labels = this.state.buttonLabels,
			max = labels.length,
			i = Math.floor(Math.random() * Math.floor(max));

		return labels[ i ];
	};

	getJoke(){
		this.setState({inProgress: true, opened: true});
		axios.get( 'https://icanhazdadjoke.com/', {
			headers: {
				'Accept': 'application/json'
			}

		})
		.then(res => {

			var joke;

			if ( res.status == 200 ){

				joke = res.data.joke
				allJokes.push( joke );
				this.setState({
					joke: joke,
					inProgress: false,
					buttonLabel: this.getRandomLabel()
				});

			} else {

				this.setState({
					joke: "Oops, something went wrong getting a joke",
					inProgress: false,
					buttonLabel: "try again"
				});

			}
		});
	};

	render(){

		const { inProgress, buttonLabel, opened } = this.state;
		var displayData;


		if (inProgress) {

			displayData = <Spinner size="large" color="teal" />

		} else {

			displayData = <TextStyle variation="subdued">{this.state.joke}</TextStyle>

		}

		return (
			<Card
				title="Wanna hear a joke?"
				primaryFooterAction= {{
					content: this.state.buttonLabel,
					onAction: this.getJoke
				}}>
				<Collapsible open={opened} id="basic-collapsible">
					<Card.Section>
						{displayData}
					</Card.Section>
				</Collapsible>
			</Card>
		)
	}

};


/*
*	Shows a tabbed card, where one tab is the GetDadJoke card and another is the OldJokes component
*/
class GetJokeTabbed extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selected: 0
		};

		this.handleTabChange = this.handleTabChange.bind(this);
	}


	handleTabChange(selectedTabIndex) {
		this.setState({selected: selectedTabIndex});
	}

	render() {
		const {selected} = this.state;

		const tabs = [
			{
				id: 'random-joke',
				content: "Random Joke",
				accessibilityLabel: 'Random Joke',
				panelID: 'random-joke-content',
				childContent: <GetDadJoke />
			},
			{
				id: 'previous-jokes',
				content: 'Previous Jokes',
				accessibilityLabel: "Previous Jokes",
				panelID: 'previous-jokes-content',
				childContent: <OldJokes />
			}
		];

		return (
			<Card>
				<Tabs
					tabs={tabs}
					selected={selected}
					onSelect={this.handleTabChange}
					fitted
				/>
				<Card.Section title={tabs[selected].content}>
					{tabs[selected].childContent}
				</Card.Section>
			</Card>
		);
	}
};

/*
*	A card that can be used to search for jokes that contain a certain term/keyword.
*/
class JokeSearch extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			keyword: "",
			limit: 10,
			searchResults: [],
			opened: false,
			inProgress: false
		};

		this.doSearch = this.doSearch.bind(this);
		this.handleChangeKeyword = this.handleChangeKeyword.bind(this);
		this.handleChangeLimit = this.handleChangeLimit.bind(this);
		this.clearResults = this.clearResults.bind(this);

	};

	doSearch(event){

		// Open the results panel and show the progress indicator:
		this.setState({
			inProgress: true,
			opened: true
		})

		// Get the actual joke:
		axios.get( 'https://icanhazdadjoke.com/search?term=' + this.state.keyword + '&limit='+ this.state.limit, {
			headers: {
				'Accept': 'application/json'
			}
		})
		.then(res => {
			var allJokes = res.data.results;
			this.setState({
				searchResults: allJokes,
				opened: true,
				inProgress: false
			})
		});
	};

	handleChangeKeyword(value) {
		this.setState({keyword: value})
	};

	handleChangeLimit(value) {
		this.setState({limit: value})
	}

	clearResults(){
		this.setState({
			searchResults:[],
			opened: false
		})
	}

	render(){

		const 	{ keyword, limit, searchResults, opened, inProgress } = this.state;
		var 	listItems;


		if (!inProgress){

			if ( searchResults.length > 0 ) {

				listItems = searchResults.map((joke) =>
					<Card.Section><p>{joke.joke}</p></Card.Section>
				);

			} else {

				listItems = <p>Sorry, no results found.</p>

			}

		} else {

			listItems = <Card.Section><Spinner size="large" color="teal" /></Card.Section>

		}

		return (
			<Card title="Lookup Jokes" sectioned>
				<Card.Section>
					<FormLayout>
						<Form onSubmit={this.doSearch}>

							<TextField
								value={keyword}
								label="Keyword"
								type="text"
								onChange={this.handleChangeKeyword}
								helpText={
									<span>Enter some keywords, eg "cat" or "hipster"</span>
								}
							/>

							<br />

							<TextField
								value={limit}
								label="Result Limit"
								type="number"
								onChange={this.handleChangeLimit}
								helpText={
									<span>Enter limit for the number of results returned</span>
								}
							/>

							<br />

							<Button submit primary>Submit</Button>
							&nbsp;&nbsp;
							<Button onClick={this.clearResults}>Clear Results</Button>

						</Form>
					</FormLayout>
				</Card.Section>

				<Collapsible open={opened} id="basic-collapsible">
					<Card.Section subdued title="Results:">
						{listItems}
					</Card.Section>
				</Collapsible>

			</Card>
		)

	}

}

export default App;
