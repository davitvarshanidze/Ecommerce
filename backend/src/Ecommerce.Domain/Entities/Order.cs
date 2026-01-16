namespace Ecommerce.Domain.Entities;

public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    
    public AppUser? User { get; set; }

    public int TotalCents { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();

    public string PaymentMethod { get; set; } = "Mock"; // "Card" | "Cash" etc.
    
    public string? CardBrand { get; set; } // "Visa" | "Mastercard" | "Amex"
    
    public string? CardLast4 { get; set; } // only last 4 digits
}