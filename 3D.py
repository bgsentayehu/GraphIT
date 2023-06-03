import pandas as pd
import plotly.graph_objects as go
import statsmodels.api as sm

# Load the CSV file
pythonData = input()
splitinfo = pythonData.split()
filename = splitinfo[0]
data = pd.read_csv(filename)

# Extract the necessary data for the graph
x_column = splitinfo[1]
y_column = splitinfo[2]
z_column = splitinfo[3]
color_column = splitinfo[4]
x = data[x_column]
y = data[y_column]
z = data[z_column]
colors = data[color_column]

# Create the 3D scatter plot using plotly.graph_objects
fig = go.Figure()
fig.add_trace(go.Scatter3d(
    x=x,
    y=y,
    z=z,
    mode='markers',
    marker=dict(
        color=colors, # Use the colors parameter to specify the color scale
        colorscale='Viridis', # Set the default color scale to Viridis
        size=5
    ),
    name=color_column # Set the name of the trace to the name of the column being used for the color scale
))

# Add a trendline using statsmodels library
model = sm.OLS(z, sm.add_constant(pd.DataFrame({'x': x, 'y': y}))).fit()
trendline_x = pd.Series([x.min(), x.max()])
trendline_y = pd.Series([y.min(), y.max()])
trendline_z = model.params[0] + model.params[1] * trendline_x + model.params[2] * trendline_y

fig.add_trace(go.Scatter3d(
    x=trendline_x,
    y=trendline_y,
    z=trendline_z,
    mode='lines',
    line=dict(
        color='red',
        width=3,
        dash='dash'
    ),
    name="Trendline",
    hovertemplate='Equation: z = %{z:.2f} + %{x:.2f}x + %{y:.2f}y<br>R-squared: %{customdata:.2f}',
    customdata=[model.rsquared] # Add the R-squared value to the customdata list
))

# Set the title and axis labels
fig.update_layout(
    title="3D Plot with Trendline",
    xaxis_title=x_column,
    yaxis_title=y_column,
    updatemenus=[{'buttons': [{'label': column, 'method': 'update', 'args': [{'x': [data[column]], 'y': [data[y_column]]}, {'xaxis.title': column}]} for column in data.columns], 'direction': 'down', 'showactive': True, 'x': 0.5, 'y': 1.2}]

)
# Add hover text to show the data points
fig.update_traces(
    hovertemplate='x: %{x}<br>y: %{y}<br>z: %{z}<br>color: %{marker.color}',
)

# Save the plot as a temporary HTML file
fig.write_html('temp.html')

# Try to open the plot in Microsoft Edge, or fallback to the default browser
import webbrowser

try:
    webbrowser.get('microsoft-edge').open('temp.html')
except:
    webbrowser.open('temp.html')