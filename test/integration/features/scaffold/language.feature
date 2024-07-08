Feature: Language

  Scenario: A language scaffolder is applied
    Given a language scaffolder is chosen
    When the project is scaffolded
    Then the README includes the core details
    And the README includes the language details
