var localStore = {};

var SearchStock = React.createClass({

    getInitialState: function() {
        return {typed: '', value: 0, quantity: 0, pricePaid: 0, cashLeft:100000, bidPrice: 0, askPrice: 0};
    },

    componentWillMount: function() {
        this.doSearch();
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    doSearch: function(term) {
        this.serverRequest = this.searchForTerm(term || '').then(this.handleSearchResult);
    },

    searchForTerm: function (term) {
    var url = 'http://data.benzinga.com/rest/richquoteDelayed?symbols=' + term;
    return $.ajax({
        url,
        dataType: 'jsonp',
        success: function (data) {
            this.setState({stocks: data});
            }.bind(this)
        });
    },

    handleSearchResult: function(quote) {
        this.setState(quote);
    },

    handleChange: function(e) {
        this.setState({typed: e.target.value});
        this.doSearch(e.target.value.toUpperCase());
    },

    handleQuantityChange: function(e) {
        this.setState({ value: parseInt(e.target.value) });
    },

    handleBuy: function(bidPrice, searchString, name){
        if(!localStore[searchString]){
        localStore[searchString] = {};
        localStore[searchString].symbol = searchString;
        localStore[searchString].name = name;
        }
        if(!localStore[searchString].quantity) {
            localStore[searchString].quantity = 0;
            localStore[searchString].pricePaid = 0;
        }
        if(this.state.cashLeft>localStore[searchString].pricePaid + (this.state.value * bidPrice)){
        localStore[searchString].quantity = localStore[searchString].quantity + this.state.value;
        localStore[searchString].pricePaid = localStore[searchString].pricePaid + (this.state.value * bidPrice);
        this.setState({cashLeft: this.state.cashLeft - localStore[searchString].pricePaid});
        }else {
            alert("You don't have enough cash");
        }
        console.log("in buy local store", JSON.stringify(localStore));
    },

    handleSell: function(askPrice, searchString){
        console.log("in sell", this.state.value);
        if(localStore[searchString].quantity>this.state.value){
        localStore[searchString].quantity = localStore[searchString].quantity - this.state.value;
        localStore[searchString].pricePaid = localStore[searchString].pricePaid - (this.state.value * askPrice);
        this.setState({cashLeft: this.state.cashLeft + localStore[searchString].pricePaid});
        } else {
            alert("You don't have enough stocks to sell");
        }
        console.log("in sell local store", JSON.stringify(localStore));
    },

    viewStock: function(e){
        var txt=document.getElementById("search").value;
        txt=e;
        document.getElementById("search").value=txt;
    },

    render: function() {
        var stocks = this.state.stocks || [];

        if(this.state.typed){
            var searchString = '';
            var name = '';
            searchString = this.state.typed.trim().toLowerCase();

            if (searchString.length > 0) {
                stocks = [stocks].filter(function(l) {
                    return l[Object.keys(l)[0]]["symbol"].toLowerCase().match(searchString);
                });
                this.state.bidPrice = parseFloat(JSON.stringify(stocks[0][searchString.toUpperCase()]["bidPrice"]));
                this.state.askPrice = parseFloat(JSON.stringify(stocks[0][searchString.toUpperCase()]["askPrice"]));
                name = stocks[0][searchString.toUpperCase()]["name"];

            }
            console.log("search string is defined", searchString);
            console.log("local storage", JSON.stringify(localStore));
        } else {
            console.log("search string is undefined");
        }

        return (
            <div>
                <div id='searchResult'>
                    <input type="text" id="search" onBlur={this.handleChange} placeholder="Type here" />
                    <ul>
                        {stocks.map(function(l) {
                            return <div>
                                <h3>{l[Object.keys(l)[0]]["name"]}</h3>
                                <table>
                                    <tr>
                                        <th>Bid</th>
                                        <th>Ask</th>
                                    </tr>
                                    <tr>
                                        <td>{l[Object.keys(l)[0]]["bidPrice"]}</td>
                                        <td>{l[Object.keys(l)[0]]["askPrice"]}</td>
                                    </tr>
                                </table>
                            </div>
                        })}
                    </ul>
                    <form>
                        <input type="text" placeholder="Quantity" onChange={this.handleQuantityChange}/>
                        <input type="button" value="Buy" onClick={this.handleBuy.bind(this, this.state.bidPrice, searchString, name)}/>
                        <input type="button" value="Sell" onClick={this.handleSell.bind(this, this.state.askPrice, searchString)}/>
                    </form>
                </div>
                <div id='currentPortfolio'>
                    <h5>Current Portfolio</h5>
                    <h5>Cash: ${this.state.cashLeft.toFixed(2)}</h5>
                    <table>
                        <tbody>
                        <tr>
                            <th>Company</th>
                            <th>Quantity</th>
                            <th>Price Paid</th>
                            <th></th>
                        </tr>
                        {Object.keys(localStore).map(function (key) {
                            return <tr key={key}>
                                <td>{localStore[key].name}</td>
                                <td>{localStore[key].quantity}</td>
                                <td>{localStore[key].pricePaid.toFixed(2)}</td>
                                <td>{<input type="button" value="View Stock" onClick={this.viewStock.bind(this, localStore[key].symbol)}/>}</td>
                            </tr>
                        }, this)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

ReactDOM.render( <SearchStock />, document.getElementById('container'));
