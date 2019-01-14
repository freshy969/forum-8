var superagent = require('superagent');
var browserHistory = require('react-router').browserHistory;
var React = require('react');
var createReactClass = require('create-react-class');
var ShowPost = require('./ShowPost.jsx');
var Filter = require('./Filter.jsx');
var Divider = require('./Divider.jsx');

var Search = createReactClass({
  displayName: 'Search',

  getInitialState: function() {
    return {
      filterValue: this.props.routeParams.searchTerm || '',
      offset: 0,
      searchResults: [],
    };
  },

  componentWillMount: function() {
    this.doSearch(this.props.routeParams.searchTerm);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.searchTerm !== this.props.searchTerm) {
      this.updateFilterValue(nextProps.routeParams.searchTerm);

      return this.doSearch(nextProps.routeParams.searchTerm);
    }
  },

  doSearch: function(searchTerm, offset = 0) {
    if (!searchTerm) {
      return false;
    }

    superagent
      .get(`/search/${searchTerm}?offset=${offset}`)
      .set('Accept', 'application/json')
      .then(
        function(response) {
          if (response.body.length === 0) {
            return this.setState({
              noResults: true,
            });
          }

          this.setState({
            searchResults: this.state.searchResults.concat(response.body),
            offset: offset,
            noResults: null,
          });
          document.body.classList.remove('is-loading');
        }.bind(this),
        function(error, a, b) {
          document.body.classList.remove('is-loading');
          console.error(error);
        },
      );
  },

  handleFilterChange: function(event) {
    this.updateFilterValue(event.target.value);
  },

  redoSearch: function(event) {
    this.setState({
      newSearch: true,
    });

    this.handleSearch(event);
  },

  handleSearch: function(event) {
    event && event.preventDefault();

    if (!this.state.filterValue.trim()) {
      return null;
    }

    document.body.classList.add('is-loading');

    if (this.state.newSearch) {
      return this.setState(
        {
          searchResults: [],
        },
        function() {
          browserHistory.push(`/search/${this.state.filterValue}`);
        }.bind(this),
      );
    }

    this.doSearch(this.state.filterValue, this.state.offset);
  },

  updateFilterValue: function(newFilterValue) {
    this.setState({
      filterValue: newFilterValue,
      newSearch: this.props.routeParams.searchTerm !== newFilterValue,
      searchResults: [],
    });
  },

  clearFilter: function() {
    this.updateFilterValue('');
    browserHistory.push(`/`);
  },

  renderResults: function() {
    if (this.state.noResults && !this.state.newSearch) {
      return (
        <div
          className="v-Atom post"
          style={{
            fontSize: '1.25em',
            textAlign: 'center',
          }}
        >
          Search again? No results found for{' '}
          <code>{this.state.filterValue}</code>.
        </div>
      );
    }

    return this.state.searchResults.map(
      function(data, index) {
        if (index > 0 && index % 20 === 0) {
          return (
            <div>
              <Divider />
              <ShowPost
                key={data.id}
                value={this.props.value}
                routeParams={this.props.routeParams}
                {...data}
              />
            </div>
          );
        }
        return (
          <ShowPost
            key={data.id}
            value={this.props.value}
            routeParams={this.props.routeParams}
            {...data}
          />
        );
      }.bind(this),
    );
  },

  renderFilterControl: function() {
    if (
      this.state.searchResults.length &&
      this.state.searchResults.length < 20
    ) {
      return (
        <button className={'input--toggle'} disabled>
          Search
        </button>
      );
    }

    if (
      !this.state.searchResults.length ||
      this.state.searchResults.length % 20 !== 0
    ) {
      return (
        <button className={'input--toggle'} onClick={this.redoSearch}>
          New Search
        </button>
      );
    }

    return (
      <button
        className={'input--toggle'}
        onClick={function() {
          this.setState(
            {
              offset: this.state.offset + 20,
            },
            this.handleSearch,
          );
        }.bind(this)}
      >
        Append More Results
      </button>
    );
  },

  render: function() {
    return (
      <div className="topicsContainer">
        <form
          onSubmit={function(event) {
            event.preventDefault();
          }}
        >
          <Filter
            clearFilter={this.clearFilter}
            onChange={this.handleFilterChange}
            placeholder="Hit ↵ to Search"
            value={this.state.filterValue}
          >
            {this.renderFilterControl()}
          </Filter>
        </form>
        {this.renderResults()}
      </div>
    );
  },
});

module.exports = Search;
