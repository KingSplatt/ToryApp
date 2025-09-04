#!/bin/bash

# Apply database migrations
dotnet ef database update --no-build

# Install dependencies
dotnet restore

# Build the application
dotnet build --configuration Release

# Run the application
dotnet run --configuration Release --urls "http://0.0.0.0:$PORT"
