define([
  "globalize",
  "react",
  "react-globalize"
], function(Globalize, React, ReactGlobalize) {

var FormatCurrency = ReactGlobalize.FormatCurrency;
var FormatMessage = ReactGlobalize.FormatMessage;

var ProductCategoryRow = React.createClass({
    render: function() {
        return (<tr><th colSpan="2">{this.props.category}</th></tr>);
    }
});

var ProductRow = React.createClass({
    render: function() {
        var name = this.props.product.stocked ?
            this.props.product.name :
            <span style={{color: "red"}}>
                {this.props.product.name}
            </span>;
        var value = this.props.product.price.value;
        var currency = this.props.product.price.currency;
        return (
            <tr>
                <td>{name}</td>
                <td>
                  <FormatCurrency value={value} currency={currency} />
                </td>
            </tr>
        );
    }
});

var ProductTable = React.createClass({
    render: function() {
        var rows = [];
        var lastCategory = null;
        this.props.products.forEach(function(product) {
            if (product.name.indexOf(this.props.filterText) === -1 || (!product.stocked && this.props.inStockOnly)) {
                return;
            }
            if (product.category !== lastCategory) {
                rows.push(<ProductCategoryRow category={product.category} key={product.category} />);
            }
            rows.push(<ProductRow product={product} key={product.name} />);
            lastCategory = product.category;
        }.bind(this));
        return (
            <table>
                <thead>
                    <tr>
                        <th><FormatMessage path="product-table/name" /></th>
                        <th><FormatMessage path="product-table/price" /></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});

var SearchBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value,
            this.refs.inStockOnlyInput.getDOMNode().checked
        );
    },
    render: function() {
        return (
            <form>
                <input
                    type="text"
                    placeholder={Globalize.formatMessage("search/placeholder")}
                    value={this.props.filterText}
                    ref="filterTextInput"
                    onChange={this.handleChange}
                />
                <p>
                    <input
                        type="checkbox"
                        checked={this.props.inStockOnly}
                        ref="inStockOnlyInput"
                        onChange={this.handleChange}
                    />
                    {" "}
                    <FormatMessage path="search/only-show-products-in-stock" />
                </p>
            </form>
        );
    }
});

var FilterableProductTable = React.createClass({
    getInitialState: function() {
        Globalize.locale(this.props.locale);
        return {
            filterText: "",
            inStockOnly: false
        };
    },

    handleUserInput: function(filterText, inStockOnly) {
        this.setState({
            filterText: filterText,
            inStockOnly: inStockOnly
        });
    },

    render: function() {
        return (
            <div>
                <SearchBar
                    filterText={this.state.filterText}
                    inStockOnly={this.state.inStockOnly}
                    onUserInput={this.handleUserInput}
                />
                <ProductTable
                    products={this.props.products}
                    filterText={this.state.filterText}
                    inStockOnly={this.state.inStockOnly}
                />
            </div>
        );
    }
});

return FilterableProductTable;

});
