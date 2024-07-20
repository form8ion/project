Feature: License Badge

  Scenario: no license file
    Given no license file exists
    And the existing README uses modern badge zones
    But the existing README has no badges
    When the project is lifted
    Then the license badge is not added to the readme

  Scenario: licensed on github
    Given a license file exists
    And the repository is hosted on "GitHub"
    And the existing README uses modern badge zones
    But the existing README has no badges
    When the project is lifted
    Then the license badge is added to the readme

  Scenario: licensed, but not on github
    Given a license file exists
    And the repository is hosted on "foo"
    And the existing README uses modern badge zones
    But the existing README has no badges
    When the project is lifted
    Then the license badge is not added to the readme
