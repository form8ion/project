Feature: Documentation

  Scenario: Simple README
    When the project is scaffolded
    Then the README includes the core details

  Scenario: README for an Open Source Project
    Given the project is "Open Source"
    When the project is scaffolded
    Then the README includes the core details
    And "Open Source" details are included in the README

  Scenario: README for an Inner Source Project
    Given the project is "Inner Source"
    When the project is scaffolded
    Then the README includes the core details
    And "Inner Source" details are included in the README

  Scenario: README for a Closed Source Project
    Given the project is "Closed Source"
    When the project is scaffolded
    Then the README includes the core details
    And "Closed Source" details are included in the README

  Scenario: Language Content in README
    Given the project is "Open Source"
    And a language scaffolder is chosen
    And the language scaffolder defines documentation content
    When the project is scaffolded
    Then the README includes the core details
    And the language content is included in the README
